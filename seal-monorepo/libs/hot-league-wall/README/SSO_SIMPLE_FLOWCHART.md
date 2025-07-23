# SSO Control Simulator - Simple Flowchart

## 🎯 Main Decision Flow

```mermaid
flowchart TD
    Start([User Access]) --> Route{Which Route?}

    Route -->|"/"| RealApp[Real App Mode]
    Route -->|"/sso-control"| Simulator[SSO Simulator Mode]

    RealApp --> RealToken[Real SSO Token Request]
    RealToken --> RealSuccess[Valid Token]
    RealSuccess --> Lobby[Show Lobby]

    Simulator --> Controls[Show SSO Controls]
    Controls --> Config{Configure Scenario}

    Config -->|Normal Flow| Normal[No Failures]
    Config -->|Invalid Token| Failure[Enable Failure Mode]
    Config -->|First Click Invalid| FirstClick[First Request Fails]

    Normal --> TokenRequest[SSO Token Request]
    Failure --> FailCount{Set Fail Count}
    FirstClick --> FirstFail[First Request = Invalid]

    FailCount --> CountFailures[Count Failures]
    CountFailures --> CheckCount{Fail Count Reached?}
    CheckCount -->|No| ReturnInvalid[Return Invalid Token]
    CheckCount -->|Yes| ReturnValid[Return Valid Token]

    FirstFail --> SubsequentValid[Subsequent = Valid]

    ReturnInvalid --> Retry[Retry Logic]
    Retry --> CountFailures

    ReturnValid --> TokenRequest
    SubsequentValid --> TokenRequest

    TokenRequest --> ValidToken[Valid Token]
    ValidToken --> Lobby

    Lobby --> End([User in Lobby])

    style Start fill:#e8f5e8
    style RealApp fill:#e1f5fe
    style Simulator fill:#fff3e0
    style End fill:#f3e5f5
    style Failure fill:#ffebee
    style FirstClick fill:#ffebee
```

## 🔧 Control Panel Flow

```mermaid
flowchart LR
    subgraph "SSO Control Panel"
        Panel[Control Panel] --> Toggles[Toggle Controls]
        Panel --> Scenarios[Scenario Selection]
        Panel --> Settings[Configuration]
        Panel --> Status[Status Display]
    end

    Toggles --> FailureToggle[Failure Mode Toggle]
    Toggles --> FirstClickToggle[First Click Invalid Toggle]

    Scenarios --> NormalScenario["🟢 Normal Flow"]
    Scenarios --> FailureScenario["🔴 Invalid Token"]

    Settings --> FailCount[Fail Count Input]
    Settings --> CurrentStatus[Current Status]

    Status --> FailureStatus[Failure Mode: ON/OFF]
    Status --> TokenStatus[Token Generation Status]
    Status --> Performance[Performance Metrics]

    style Panel fill:#f3e5f5
    style NormalScenario fill:#e8f5e8
    style FailureScenario fill:#ffebee
```

## 📊 Token Request Decision Tree

```mermaid
flowchart TD
    Request[Token Request] --> Mode{Simulator Mode?}

    Mode -->|No| RealRequest[Real SSO Request]
    Mode -->|Yes| CheckState{Check Simulation State}

    CheckState --> FailureMode{Failure Mode Active?}
    CheckState --> FirstClickMode{First Click Invalid Active?}

    FailureMode -->|Yes| CountFailures[Count Current Failures]
    FailureMode -->|No| RealRequest

    FirstClickMode -->|Yes| CheckFirst{Is First Request?}
    FirstClickMode -->|No| RealRequest

    CountFailures --> FailLimit{Fail Count Reached?}
    FailLimit -->|No| GenerateInvalid[Generate Invalid Token]
    FailLimit -->|Yes| RealRequest

    CheckFirst -->|Yes| GenerateInvalid
    CheckFirst -->|No| RealRequest

    GenerateInvalid --> ReturnInvalid[Return Invalid Token]
    RealRequest --> ReturnValid[Return Valid Token]

    ReturnInvalid --> End[End Request]
    ReturnValid --> End

    style Request fill:#e3f2fd
    style RealRequest fill:#e8f5e8
    style GenerateInvalid fill:#ffebee
    style End fill:#f3e5f5
```

## 🎮 State Transitions

```mermaid
stateDiagram-v2
    [*] --> Initial

    Initial --> Normal: Default
    Initial --> Failure: Enable Failure
    Initial --> FirstClick: Enable First Click Invalid

    Normal --> Failure: toggleFailure()
    Normal --> FirstClick: toggleFirstClickInvalidToken()

    Failure --> Normal: toggleFailure()
    Failure --> FirstClick: toggleFirstClickInvalidToken()

    FirstClick --> Normal: toggleFirstClickInvalidToken()
    FirstClick --> Failure: toggleFailure()

    state Failure {
        [*] --> Counting
        Counting --> Success: failCount reached
        Success --> Counting: reset
    }

    state FirstClick {
        [*] --> First
        First --> Subsequent: first request done
        Subsequent --> First: reset
    }

    style Initial fill:#e8f5e8
    style Normal fill:#e8f5e8
    style Failure fill:#ffebee
    style FirstClick fill:#fff3e0
```

## 🚀 Quick Usage Guide

```mermaid
flowchart LR
    subgraph "Getting Started"
        Access[Access App] --> Choose{Choose Mode}

        Choose -->|Production| Prod[Real App Mode]
        Choose -->|Testing| Test[SSO Simulator Mode]

        Prod --> Deploy[Deploy to Production]

        Test --> Setup[Setup Scenarios]
        Setup --> Validate[Test Different Cases]
        Validate --> Monitor[Monitor Performance]
        Monitor --> Deploy
    end

    subgraph "Common Scenarios"
        Scenario1["🟢 Normal Flow"]
        Scenario2["🔴 Persistent Failure"]
        Scenario3["🟡 First Click Invalid"]
    end

    Setup --> Scenario1
    Setup --> Scenario2
    Setup --> Scenario3

    style Access fill:#e8f5e8
    style Prod fill:#e1f5fe
    style Test fill:#fff3e0
    style Deploy fill:#f3e5f5
    style Scenario1 fill:#e8f5e8
    style Scenario2 fill:#ffebee
    style Scenario3 fill:#fff3e0
```

## 🔍 Debug Flow

```mermaid
flowchart TD
    Issue[SSO Issue] --> Debug{Debug Steps}

    Debug --> CheckRoute{Check Route}
    CheckRoute -->|"/sso-control"| CheckControls{Controls Visible?}
    CheckRoute -->|"/"| RealMode[Real App Mode - No Controls]

    CheckControls -->|Yes| CheckState{Simulator State}
    CheckControls -->|No| ConfigIssue[Configuration Issue]

    CheckState --> FailureState{Failure Mode Active?}
    CheckState --> FirstClickState{First Click Invalid Active?}

    FailureState -->|Yes| CheckCount{Fail Count Set?}
    FailureState -->|No| NormalMode[Normal Mode - Should Work]

    FirstClickState -->|Yes| CheckFirst{First Request?}
    FirstClickState -->|No| NormalMode

    CheckCount -->|Yes| CountIssue[Count Issue]
    CheckCount -->|No| DefaultCount[Using Default Count]

    CheckFirst -->|Yes| ExpectedFail[Expected Failure]
    CheckFirst -->|No| ShouldWork[Should Work Now]

    ConfigIssue --> FixConfig[Fix Environment Config]
    CountIssue --> AdjustCount[Adjust Fail Count]
    DefaultCount --> SetCount[Set Fail Count]
    ExpectedFail --> Retry[Retry Request]
    ShouldWork --> CheckLogs[Check Console Logs]
    NormalMode --> CheckLogs

    style Issue fill:#ffebee
    style RealMode fill:#e1f5fe
    style NormalMode fill:#e8f5e8
    style ExpectedFail fill:#fff3e0
```

## 📈 Performance Monitoring

```mermaid
flowchart LR
    subgraph "Performance Tracking"
        Start[Request Start] --> Timer[Start Timer]
        Timer --> Process[Process Request]
        Process --> End[Request End]
        End --> Calculate[Calculate Duration]
        Calculate --> Log[Log Performance]
        Log --> Metrics[Collect Metrics]
    end

    subgraph "Metrics Collected"
        Duration[Request Duration]
        Success[Success Rate]
        Retries[Retry Count]
        Errors[Error Types]
    end

    Metrics --> Duration
    Metrics --> Success
    Metrics --> Retries
    Metrics --> Errors

    style Start fill:#e3f2fd
    style End fill:#e8f5e8
    style Log fill:#fff3e0
    style Metrics fill:#f3e5f5
```

---

## 🎯 Key Takeaways

### 🟢 **Normal Flow**

-   No simulation
-   Direct SSO requests
-   Immediate success

### 🔴 **Failure Mode**

-   Simulates persistent failures
-   Configurable fail count
-   Eventually succeeds after N failures

### 🟡 **First Click Invalid**

-   First request fails
-   Subsequent requests succeed
-   Tests retry mechanisms

### 📊 **Monitoring**

-   Performance metrics
-   Console logging
-   Success/failure tracking

---

_These simplified flowcharts provide a quick visual reference for understanding the SSO Control Simulator's key flows and decision points._
