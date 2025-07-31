<!-- @format -->

# Sentry Message Flow Diagrams

## Overview

This document provides detailed message flow diagrams showing how individual messages and batched messages are processed through the Sentry system, including data transformations, filtering, and delivery mechanisms.

## 1. Single Message Processing Flow

```mermaid
graph TD
    A[React Component] --> B[logError/logInfo/logWarning]
    B --> C[Check Logging Enabled]
    C --> D[Skip Processing]
    C --> E[Create Log Entry]
    E --> F[Add Component Context]
    F --> G[Add Timestamp]
    G --> H[Add Log Level]
    H --> I[Add Custom Context]
    I --> J[Filter Component-Specific]
    J --> K[Component Match]
    K --> L[Skip - Not Component Error]
    K --> M[Rate Limiting Check]
    M --> N[Pass Rate Limit]
    N --> O[Drop Event - Rate Limited]
    N --> P[Send to Sentry]
    P --> Q[@sentry/react]
    Q --> R[Sentry Dashboard]

    style A fill:#e1f5fe
    style E fill:#f3e5f5
    style P fill:#fff3e0
    style Q fill:#fff3e0
    style R fill:#e8f5e8
```

### Single Message Data Transformation

```mermaid
graph LR
    subgraph "Input Data"
        A[Error Object] --> A1[Error Message]
        A --> A2[Stack Trace]
        A --> A3[Error Type]
    end

    subgraph "Context Addition"
        B[Component Name] --> B1[Component Context]
        C[Timestamp] --> B1
        D[Log Level] --> B1
        E[Custom Context] --> B1
    end

    subgraph "Sentry Format"
        F[Sentry Event] --> F1[Event Type: exception]
        F --> F2[Level: error]
        F --> F3[Tags: component, source]
        F --> F4[Context: custom data]
        F --> F5[Timestamp: ISO string]
    end

    A1 --> F1
    A2 --> F1
    A3 --> F1
    B1 --> F3
    B1 --> F4
    C --> F5

    style A fill:#e1f5fe
    style F fill:#fff3e0
```

## 2. Batch Message Processing Flow

```mermaid
graph TD
    A[React Component] --> B[logInfo/logError/logWarning]
    B --> C[Check Logging Enabled]
    C --> D[Skip Processing]
    C --> E[Add to Component Batch]
    E --> F[Store in Batch Queue]
    F --> G[Add to Component Map]
    G --> H[Should Flush Immediately]
    H --> I[Wait for Timer]
    H --> J[Trigger Immediate Flush]
    I --> K[Timer Event - 5s]
    K --> L[Flush All Batches]
    J --> M[Process Component Batch]
    L --> M
    M --> N[Group Logs by Level]
    N --> O[Create Summary Message]
    O --> P[Calculate Highest Level]
    P --> Q[Create Batch Context]
    Q --> R[Send Summary to Sentry]
    R --> S[@sentry/react]
    S --> T[Sentry Dashboard]

    style A fill:#e1f5fe
    style E fill:#f3e5f5
    style M fill:#fff3e0
    style S fill:#fff3e0
    style T fill:#e8f5e8
```

### Batch Message Data Transformation

```mermaid
graph LR
    subgraph "Individual Logs"
        A1[Log 1: info] --> A[Batch Queue]
        A2[Log 2: error] --> A
        A3[Log 3: warn] --> A
        A4[Log 4: info] --> A
    end

    subgraph "Batch Processing"
        B[Group by Level] --> B1[Info: 2 logs]
        B --> B2[Error: 1 log]
        B --> B3[Warn: 1 log]
    end

    subgraph "Summary Creation"
        C[Summary Message] --> C1[Component: MyComponent]
        C --> C2[Total: 4 logs]
        C --> C3[Levels: info:2, error:1, warn:1]
        C --> C4[Highest Level: error]
    end

    subgraph "Sentry Format"
        D[Sentry Event] --> D1[Event Type: message]
        D --> D2[Level: error]
        D --> D3[Message: Batch Summary]
        D --> D4[Tags: component, batchSize]
        D --> D5[Context: levelDetails, recentLogs]
    end

    A --> B
    B1 --> C3
    B2 --> C3
    B3 --> C3
    C --> D

    style A fill:#e1f5fe
    style C fill:#f3e5f5
    style D fill:#fff3e0
```

## 3. Detailed Single Message Processing

```mermaid
sequenceDiagram
    participant Comp as React Component
    participant Helper as SentryHelper
    participant Manager as SentryManager
    participant Filter as Error Filter
    participant Rate as Rate Limiter
    participant Sentry as @sentry/react
    participant Config as LocalStorage

    Comp->>Helper: logError('MyComponent', error, context)

    Helper->>Config: getLocalStorageConfig()
    Config-->>Helper: {enabled: true, logLevel: 'info'}

    Helper->>Helper: isLoggingEnabled('MyComponent', 'error')
    Helper-->>Helper: true (ERROR >= INFO)

    Helper->>Manager: logError(error, context)

    Manager->>Filter: isComponentError(error.message)
    Filter-->>Manager: true (contains 'MyComponent')

    Manager->>Rate: Check rate limiting
    Rate-->>Manager: true (10% sample rate passed)

    Manager->>Sentry: captureException(error, {level: 'error', tags: {component: 'MyComponent', ...context}})
    Sentry-->>Manager: Event sent successfully

    Manager-->>Helper: Success
    Helper-->>Comp: Logged successfully
```

## 4. Detailed Batch Message Processing

```mermaid
sequenceDiagram
    participant Comp as React Component
    participant Helper as SentryHelperBatched
    participant BatchMgr as SentryBatchManager
    participant Queue as Batch Queue
    participant Timer as Flush Timer
    participant Processor as Batch Processor
    participant Sentry as @sentry/react

    Comp->>Helper: logInfo('MyComponent', 'User clicked button', context)

    Helper->>Helper: isLoggingEnabled('MyComponent', 'info')
    Helper-->>Helper: true

    Helper->>BatchMgr: addLog('MyComponent', message, 'info', context)

    BatchMgr->>Queue: Add to component batch
    Queue-->>BatchMgr: Added successfully

    BatchMgr->>BatchMgr: shouldFlushImmediately(batch)
    BatchMgr-->>BatchMgr: false (no high priority logs)

    Note over Timer: Wait for 5-second timer

    Timer->>BatchMgr: flushAllBatches()
    BatchMgr->>Processor: flushComponentBatch('MyComponent')

    Processor->>Processor: groupLogsByLevel(logs)
    Processor-->>Processor: {info: [log1, log2], error: [log3]}

    Processor->>Processor: createSummaryMessage('MyComponent', groupedLogs)
    Processor-->>Processor: '[MyComponent] Batch Log Summary - Total: 3 (info: 2, error: 1)'

    Processor->>Processor: getHighestLevel(logs)
    Processor-->>Processor: 'error'

    Processor->>Sentry: captureMessage(summary, {level: 'error', tags: {component: 'MyComponent', batchSize: 3, ...context}})
    Sentry-->>Processor: Event sent successfully

    Processor->>Queue: Clear batch
    Queue-->>Processor: Batch cleared

    Processor-->>BatchMgr: Flush completed
    BatchMgr-->>Timer: All batches flushed
```

## 5. Buffer Overflow Prevention Flow

```mermaid
graph TD
    A[Log Event] --> B[BeforeSend Filter]
    B --> C[Event Level Check]
    C --> D[5% Sample Rate]
    C --> E[20% Sample Rate]
    C --> F[100% Sample Rate]
    D --> G[Math.random > 0.05]
    E --> H[Math.random > 0.2]
    F --> I[Process Event]
    G --> J[Drop Event]
    G --> I
    H --> J
    H --> I
    I --> K[Check Buffer Overflow]
    K --> L[Buffer Full]
    L --> M[Send to Sentry]
    L --> N[Clear Buffer]
    N --> O[Flush Pending Events]
    O --> P[Drop Overflow Event]
    P --> Q[Reset Buffer State]
    M --> R[Sentry Dashboard]

    style A fill:#e1f5fe
    style I fill:#f3e5f5
    style N fill:#ffebee
    style M fill:#fff3e0
    style R fill:#e8f5e8
```

## 6. Workflow Tracking Message Flow

```mermaid
sequenceDiagram
    participant Comp as React Component
    participant Helper as SentryHelper
    participant Manager as SentryManager
    participant Workflow as Workflow Tracker
    participant Sentry as @sentry/react

    Comp->>Helper: startWorkflow('workflow-1', 'User Login', 'MyComponent', metadata)

    Helper->>Workflow: Create workflow config
    Workflow-->>Helper: Workflow created

    Helper->>Manager: startWorkflow('workflow-1', 'User Login', metadata)
    Manager->>Sentry: captureMessage('Workflow started: User Login (ID: workflow-1)', {level: 'info', tags: {component: 'MyComponent', workflowId: 'workflow-1', ...metadata}})
    Sentry-->>Manager: Event sent

    Helper-->>Comp: Workflow started

    Note over Comp: Workflow execution...

    Comp->>Helper: updateWorkflow('workflow-1', 'in_progress', {step: 'validation'})

    Helper->>Workflow: Update workflow state
    Workflow-->>Helper: State updated

    Helper->>Manager: updateWorkflow('workflow-1', 'in_progress', {step: 'validation'})
    Manager->>Sentry: captureMessage('Workflow updated: in_progress (ID: workflow-1)', {level: 'info', tags: {component: 'MyComponent', workflowId: 'workflow-1', workflowState: 'in_progress', step: 'validation'}})
    Sentry-->>Manager: Event sent

    Helper-->>Comp: Workflow updated

    Note over Comp: Workflow completion...

    Comp->>Helper: completeWorkflow('workflow-1', true, {result: 'success'})

    Helper->>Workflow: Calculate duration and complete
    Workflow-->>Helper: Duration: 1500ms

    Helper->>Manager: completeWorkflow('workflow-1', true, {result: 'success', duration: 1500})
    Manager->>Sentry: captureMessage('Workflow completed: Success (ID: workflow-1)', {level: 'info', tags: {component: 'MyComponent', workflowId: 'workflow-1', workflowSuccess: true, duration: 1500, result: 'success'}})
    Sentry-->>Manager: Event sent

    Helper->>Workflow: Cleanup workflow
    Workflow-->>Helper: Workflow removed

    Helper-->>Comp: Workflow completed
```

## 7. Performance Tracking Message Flow

```mermaid
sequenceDiagram
    participant Comp as React Component
    participant Helper as SentryHelper
    participant Manager as SentryManager
    participant Timer as Performance Timer
    participant Sentry as @sentry/react

    Comp->>Helper: trackPerformance('MyComponent', 'API Call', async () => { ... })

    Helper->>Timer: Start performance tracking
    Timer-->>Helper: Start time recorded

    Helper->>Helper: Execute operation
    Helper-->>Helper: Operation result

    Helper->>Timer: End performance tracking
    Timer-->>Helper: Duration: 250ms

    Helper->>Manager: trackPerformance('API Call', () => Promise.resolve(result))
    Manager->>Sentry: captureMessage('Performance: API Call took 250.00ms', {level: 'info', tags: {component: 'MyComponent', operationName: 'API Call', duration: '250.00'}})
    Sentry-->>Manager: Event sent

    Manager-->>Helper: Performance tracked
    Helper-->>Comp: Operation completed with performance data
```

## 8. Configuration Priority Flow

```mermaid
graph TD
    A[Log Request] --> B[Get Configuration]

    B --> C[Component LocalStorage]
    C --> D[Component Config Exists Check]

    D --> E[Use Component Config]
    D --> F[Global LocalStorage]

    F --> G[Global Config Exists Check]
    G --> H[Use Global Config]
    G --> I[Use Default Config]

    E --> J[Apply Configuration]
    H --> J
    I --> J

    J --> K[Logging Enabled Check]
    K --> L[Skip Logging]
    K --> M[Level Check]

    M --> N[Process Log]
    M --> L

    N --> O[Send to Sentry]

    style A fill:#e1f5fe
    style E fill:#f3e5f5
    style H fill:#f3e5f5
    style I fill:#f3e5f5
    style N fill:#fff3e0
    style O fill:#fff3e0
```

## 9. Error Recovery and Fallback Flow

```mermaid
graph TD
    A[Send to Sentry] --> B[Success Check]

    B --> C[Log Success]
    B --> D[Error Recovery]

    D --> E[Retry Count Check]
    E --> F[Retry with Backoff]
    E --> G[Fallback Handler]

    F --> H[Wait 1s, 2s, 4s]
    H --> I[Retry Send]
    I --> B

    G --> J[Console Log Error]
    J --> K[Store in LocalStorage]
    K --> L[Queue for Later]

    L --> M[Periodic Retry]
    M --> N[Network Available Check]
    N --> O[Retry Stored Events]
    N --> P[Keep in Queue]

    O --> B
    P --> Q[Wait for Network]
    Q --> M

    style A fill:#e1f5fe
    style D fill:#ffebee
    style G fill:#ffebee
    style J fill:#fff3e0
    style O fill:#f3e5f5
```

## 10. Message Data Structure Comparison

### Single Message Structure

```json
{
    "type": "exception",
    "level": "error",
    "message": "User authentication failed",
    "timestamp": "2024-01-15T10:30:45.123Z",
    "tags": {
        "component": "MyComponent",
        "source": "SentryManager",
        "userId": "12345"
    },
    "contexts": {
        "component": {
            "name": "MyComponent"
        },
        "custom": {
            "operation": "login",
            "attempt": 3
        }
    },
    "exception": {
        "type": "AuthenticationError",
        "value": "Invalid credentials",
        "stacktrace": "..."
    }
}
```

### Batch Message Structure

```json
{
    "type": "message",
    "level": "error",
    "message": "[MyComponent] Batch Log Summary - Total: 5 (info: 2, error: 1, warn: 2)",
    "timestamp": "2024-01-15T10:30:45.123Z",
    "tags": {
        "component": "MyComponent",
        "batchSize": 5,
        "source": "SentryBatchManager"
    },
    "contexts": {
        "batch": {
            "batchSize": 5,
            "timestamp": 1705315845123,
            "levels": {
                "info": {
                    "count": 2,
                    "messages": [
                        { "message": "User clicked button", "timestamp": 1705315844000 },
                        { "message": "API call started", "timestamp": 1705315844100 }
                    ]
                },
                "error": {
                    "count": 1,
                    "messages": [{ "message": "API call failed", "timestamp": 1705315844200 }]
                },
                "warn": {
                    "count": 2,
                    "messages": [
                        { "message": "Slow response time", "timestamp": 1705315844300 },
                        { "message": "Retry attempt", "timestamp": 1705315844400 }
                    ]
                }
            },
            "recentLogs": [
                {
                    "level": "info",
                    "message": "User clicked button",
                    "timestamp": 1705315844000
                },
                {
                    "level": "info",
                    "message": "API call started",
                    "timestamp": 1705315844100
                },
                {
                    "level": "error",
                    "message": "API call failed",
                    "timestamp": 1705315844200
                },
                {
                    "level": "warn",
                    "message": "Slow response time",
                    "timestamp": 1705315844300
                },
                {
                    "level": "warn",
                    "message": "Retry attempt",
                    "timestamp": 1705315844400
                }
            ]
        }
    }
}
```

## Key Differences Summary

| Aspect             | Single Message         | Batch Message         |
| ------------------ | ---------------------- | --------------------- |
| **Processing**     | Immediate              | Buffered              |
| **Delivery**       | Real-time              | Periodic (5s)         |
| **Data Structure** | Individual event       | Summarized batch      |
| **Performance**    | Higher overhead        | Optimized             |
| **Context**        | Full context per event | Aggregated context    |
| **Error Handling** | Individual retry       | Batch retry           |
| **Memory Usage**   | Lower                  | Higher (temporary)    |
| **Network Usage**  | More requests          | Fewer requests        |
| **Use Case**       | Critical errors        | High-volume logging   |
| **Configuration**  | Component-specific     | Global batch settings |

This comprehensive flow analysis shows how the Sentry system handles both individual and batched messages, providing flexibility for different logging requirements while maintaining performance and reliability.
