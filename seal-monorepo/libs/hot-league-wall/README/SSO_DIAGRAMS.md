# SSO Control Simulator - Visual Diagrams

## 📊 Architecture Overview

```mermaid
graph TB
    subgraph "Application Routes"
        A[User Access] --> B{Which Route?}
        B -->|"/"| C[Real App Mode]
        B -->|"/sso-control"| D[SSO Simulator Mode]
    end

    subgraph "Real App Mode"
        C --> E[TokenRequestManager]
        E --> F[Real SSO Service]
        F --> G[Valid Token]
        G --> H[Lobby Component]
    end

    subgraph "SSO Simulator Mode"
        D --> I[SSO Control Panel]
        I --> J[useSSOSimulator Hook]
        J --> K{Simulation State}
        K -->|Failure Mode ON| L[Generate Invalid Token]
        K -->|Failure Mode OFF| M[Generate Real Token]
        L --> N[Simulated Response]
        M --> N
        N --> O[App with Simulation]
    end

    style C fill:#e1f5fe
    style D fill:#fff3e0
    style I fill:#f3e5f5
    style J fill:#f3e5f5
```

## 🔄 SSO Token Request Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as App Component
    participant T as TokenRequestManager
    participant S as SSO Service
    participant L as Lobby

    U->>A: Click Play Button
    A->>T: executeTokenRequest('FIRST_SSO')

    alt Real App Mode
        T->>S: Real SSO Request
        S->>T: Valid Token
        T->>A: Token Response
        A->>L: Initialize with Token
    else Simulator Mode
        T->>T: Check Simulation State
        alt Failure Mode Active
            T->>A: Invalid Token
            A->>A: Retry Logic
            T->>T: Check Fail Count
            alt Fail Count Exceeded
                T->>S: Real SSO Request
                S->>T: Valid Token
            end
        else Normal Mode
            T->>S: Real SSO Request
            S->>T: Valid Token
        end
        T->>A: Token Response
        A->>L: Initialize with Token
    end

    L->>U: Show Lobby Interface
```

## 🎮 Simulator State Management

```mermaid
stateDiagram-v2
    [*] --> InitialState

    InitialState --> NormalFlow: Default Config
    InitialState --> FailureMode: Enable Failure
    InitialState --> FirstClickInvalid: Enable First Click Invalid

    NormalFlow --> FailureMode: toggleFailure()
    NormalFlow --> FirstClickInvalid: toggleFirstClickInvalidToken()

    FailureMode --> NormalFlow: toggleFailure()
    FailureMode --> FirstClickInvalid: toggleFirstClickInvalidToken()

    FirstClickInvalid --> NormalFlow: toggleFirstClickInvalidToken()
    FirstClickInvalid --> FailureMode: toggleFailure()

    state FailureMode {
        [*] --> CountingFailures
        CountingFailures --> SuccessAfterFailures: failCount reached
        SuccessAfterFailures --> CountingFailures: reset
    }

    state FirstClickInvalid {
        [*] --> FirstRequest
        FirstRequest --> SubsequentRequests: first request completed
        SubsequentRequests --> FirstRequest: reset scenario
    }
```

## 🎯 Scenario Configuration

```mermaid
graph LR
    subgraph "Predefined Scenarios"
        S1[Normal Flow]
        S2[Invalid Token]
    end

    subgraph "Scenario Settings"
        SET1[Failure Mode: OFF]
        SET2[Failure Mode: ON]
    end

    S1 --> SET1
    S2 --> SET2

    subgraph "Custom Configuration"
        C1[Manual Toggle Controls]
        C2[Fail Count Setting]
        C3[First Click Invalid Toggle]
    end

    C1 --> SET1
    C1 --> SET2
    C2 --> SET2
    C3 --> SET1
```

## 🔧 Control Panel Interface

```mermaid
graph TB
    subgraph "SSO Control Simulator UI"
        UI[Control Panel]

        subgraph "Toggle Controls"
            T1[Failure Mode Toggle]
            T2[First Click Invalid Toggle]
        end

        subgraph "Scenario Selection"
            S1[Scenario Dropdown]
            S2[Scenario Description]
        end

        subgraph "Configuration"
            C1[Fail Count Input]
            C2[Current Status Display]
        end

        subgraph "Status Indicators"
            I1[Failure Mode Status]
            I2[Token Generation Status]
            I3[Performance Metrics]
        end
    end

    UI --> T1
    UI --> T2
    UI --> S1
    UI --> S2
    UI --> C1
    UI --> C2
    UI --> I1
    UI --> I2
    UI --> I3
```

## 📈 Performance Monitoring Flow

```mermaid
graph LR
    subgraph "Token Request Process"
        R1[Request Start] --> R2[Token Generation]
        R2 --> R3[Response End]
    end

    subgraph "Performance Tracking"
        P1[Start Time] --> P2[Duration Calculation]
        P2 --> P3[Success/Failure Log]
        P3 --> P4[Console Output]
    end

    subgraph "Metrics Collection"
        M1[Request Duration]
        M2[Success Rate]
        M3[Retry Count]
        M4[Error Types]
    end

    R1 --> P1
    R3 --> P2
    P3 --> M1
    P3 --> M2
    P3 --> M3
    P3 --> M4
    P4 --> M1
    P4 --> M2
    P4 --> M3
    P4 --> M4
```

## 🛠️ Troubleshooting Decision Tree

```mermaid
graph TD
    Start[SSO Issue Detected] --> Q1{SSO Controls Visible?}

    Q1 -->|No| A1[Check Environment Config]
    Q1 -->|Yes| Q2{Simulator Responding?}

    A1 --> A2[Verify showSSOControls Flag]
    A2 --> A3[Check Route: /sso-control]

    Q2 -->|No| B1[Check Route Path]
    Q2 -->|Yes| Q3{Token Requests Failing?}

    B1 --> B2[Ensure on /sso-control]
    B2 --> B3[Verify Simulator Initialization]

    Q3 -->|Yes| C1[Check Failure Mode]
    Q3 -->|No| D1[Check Performance Logs]

    C1 --> C2[Verify isFailureMode State]
    C2 --> C3[Check failCount Setting]

    D1 --> D2[Monitor Console Logs]
    D2 --> D3[Check Network Conditions]

    A3 --> End[Issue Resolved]
    B3 --> End
    C3 --> End
    D3 --> End
```

## 🔄 Session Reconnect Flow

```mermaid
sequenceDiagram
    participant L as Lobby
    participant A as App Component
    participant T as TokenRequestManager
    participant S as SSO Service

    L->>A: Session Expired
    A->>A: Set Reconnecting State
    A->>T: executeTokenRequest('SSO_RETRY')

    alt Real App Mode
        T->>S: Real SSO Request
        S->>T: New Valid Token
    else Simulator Mode
        T->>T: Check Simulation State
        alt Failure Mode Active
            T->>A: Invalid Token
            A->>A: Retry Logic
        else Normal Mode
            T->>S: Real SSO Request
            S->>T: New Valid Token
        end
    end

    T->>A: Token Response
    A->>A: Clear Reconnecting State
    A->>L: Reconnect with New Token
    L->>L: Resume Normal Operation
```

## 🎯 Testing Scenarios Matrix

```mermaid
graph TB
    subgraph "Testing Matrix"
        subgraph "Scenario Types"
            ST1[Normal Flow]
            ST2[Persistent Failure]
            ST3[First Click Invalid]
            ST4[Session Reconnect]
            ST5[Performance Test]
        end

        subgraph "Expected Outcomes"
            EO1[Immediate Success]
            EO2[N Failures then Success]
            EO3[1 Failure then Success]
            EO4[Token Refresh]
            EO5[Performance Metrics]
        end

        subgraph "Configuration"
            C1[isFailureMode: false]
            C2[isFailureMode: true]
            C3[isFirstClickInvalidTokenMode: true]
            C4[Default Settings]
            C5[Performance Monitoring]
        end
    end

    ST1 --> EO1
    ST1 --> C1

    ST2 --> EO2
    ST2 --> C2

    ST3 --> EO3
    ST3 --> C3

    ST4 --> EO4
    ST4 --> C4

    ST5 --> EO5
    ST5 --> C5
```

## 🚀 Quick Start Flow

```mermaid
graph LR
    subgraph "Getting Started"
        Start[Access Application] --> Route{Choose Route}

        Route -->|"/"| RealApp[Real App Mode]
        Route -->|"/sso-control"| Simulator[SSO Simulator Mode]

        RealApp --> RealFlow[Direct SSO Requests]
        Simulator --> SimFlow[Interactive Controls]

        SimFlow --> Config[Configure Scenarios]
        Config --> Test[Test Different Cases]
        Test --> Monitor[Monitor Performance]

        RealFlow --> Deploy[Production Ready]
        Monitor --> Deploy
    end

    style Start fill:#e8f5e8
    style RealApp fill:#e1f5fe
    style Simulator fill:#fff3e0
    style Deploy fill:#f3e5f5
```

## 📊 Component Relationship Diagram

```mermaid
graph TB
    subgraph "Core Components"
        Preview[Preview.tsx]
        App[App.tsx]
        Simulator[Simulator Module]
        SSOControls[SSO Control Simulator]
    end

    subgraph "Hooks & Utilities"
        useSSO[useSSOSimulator]
        useToken[useTokenRequest]
        useConfig[useAppConfiguration]
        TokenManager[TokenRequestManager]
    end

    subgraph "State Management"
        State[Simulator State]
        Config[App Configuration]
        TokenState[Token State]
    end

    Preview --> App
    Preview --> SSOControls
    Preview --> Simulator

    App --> TokenManager
    App --> useToken

    SSOControls --> useSSO
    SSOControls --> State

    Simulator --> useConfig
    Simulator --> Config

    useSSO --> State
    useToken --> TokenState
    useConfig --> Config

    TokenManager --> TokenState
```

## 🎨 UI Component Hierarchy

```mermaid
graph TD
    subgraph "Preview Component"
        Preview[Preview.tsx]

        subgraph "Routes"
            Route1[Default Route]
            Route2[SSO Control Route]
            Route3[RNG Soccer Demo Route]
        end

        subgraph "SSO Control Route Components"
            SSOPanel[SSO Control Panel]
            FailureLogic[SSO Failure Mode Logic]
            ResetWrapper[Scenario Reset Wrapper]
            AppWrapper[App Component]
        end
    end

    Preview --> Route1
    Preview --> Route2
    Preview --> Route3

    Route2 --> SSOPanel
    Route2 --> FailureLogic
    Route2 --> ResetWrapper
    Route2 --> AppWrapper

    SSOPanel --> Controls[Toggle Controls]
    SSOPanel --> Scenarios[Scenario Selection]
    SSOPanel --> Status[Status Display]

    FailureLogic --> Logic[Failure Logic]
    ResetWrapper --> Reset[Component Reset]
    AppWrapper --> App[Main App]
```

---

## 📝 Diagram Legend

### Colors

-   🔵 **Blue**: Real App Mode components
-   🟠 **Orange**: SSO Simulator Mode components
-   🟣 **Purple**: State management and hooks
-   🟢 **Green**: Success states and normal flow
-   🔴 **Red**: Error states and failure scenarios

### Shapes

-   **Rectangle**: Components and modules
-   **Diamond**: Decision points and conditions
-   **Circle**: Start/end points
-   **Parallelogram**: Input/output operations

### Arrows

-   **Solid Arrow**: Direct flow and relationships
-   **Dashed Arrow**: Optional or conditional flow
-   **Bold Arrow**: Primary flow path

---

_These diagrams provide a visual understanding of the SSO Control Simulator architecture, helping developers quickly grasp the system's structure and flow patterns._
