# Hot League Wall Library 測試指南

## 測試環境設置

這個 library 使用以下測試工具：
- **Jest** - 測試框架
- **@testing-library/react** - React 組件測試
- **@testing-library/jest-dom** - 額外的 Jest 匹配器
- **Nx** - 測試運行器

## 運行測試

### 基本測試命令

```bash
# 運行所有測試
npm test

# 監視模式（開發時推薦）
npm run test:watch

# 生成覆蓋率報告
npm run test:coverage

# 調試模式
npm run test:debug
```

### 使用 Nx 命令

```bash
# 從 monorepo 根目錄運行
nx test hot-league-wall

# 監視模式
nx test hot-league-wall --watch

# 覆蓋率
nx test hot-league-wall --coverage

# 調試模式
nx test hot-league-wall --runInBand
```

## 測試文件結構

```
__tests__/
├── _shared/
│   ├── components/
│   │   ├── anim-balance/
│   │   │   └── anim-balance.spec.tsx
│   │   └── [其他組件]/
│   ├── utils/
│   │   └── [工具函數測試]
│   └── handlers/
│       └── [處理器測試]
├── games/
│   ├── game-base/
│   │   ├── message-logic.spec.ts
│   │   └── [其他遊戲邏輯測試]
│   └── saba-club/
│       └── [Saba Club 遊戲測試]
└── [其他測試目錄]
```

## 測試類型

### 1. 組件測試 (Component Tests)

測試 React 組件的渲染、交互和行為。

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyComponent from '../../src/components/MyComponent';

describe('MyComponent', () => {
    it('should render correctly', () => {
        render(<MyComponent prop="value" />);
        expect(screen.getByText('expected text')).toBeInTheDocument();
    });

    it('should handle user interactions', () => {
        render(<MyComponent />);
        const button = screen.getByRole('button');
        fireEvent.click(button);
        expect(screen.getByText('clicked')).toBeInTheDocument();
    });
});
```

### 2. 工具函數測試 (Utility Tests)

測試純函數和工具方法。

```typescript
import { formatNumber } from '../../src/utils/formatters';

describe('formatNumber', () => {
    it('should format positive numbers', () => {
        expect(formatNumber(1000)).toBe('1,000');
    });

    it('should handle decimals', () => {
        expect(formatNumber(1000.5)).toBe('1,000.5');
    });
});
```

### 3. 遊戲邏輯測試 (Game Logic Tests)

測試遊戲相關的業務邏輯。

```typescript
import { calculateWinnings } from '../../src/games/game-logic/calculations';

describe('calculateWinnings', () => {
    it('should calculate correct winnings for winning bet', () => {
        const result = calculateWinnings(100, 2.5);
        expect(result).toBe(250);
    });
});
```

## Mock 策略

### 1. 外部依賴 Mock

```typescript
// Mock 外部 library
jest.mock('@sg/sg-game-client', () => ({
    FormatUtils: {
        numberWithCommas: jest.fn((num, decimals) => 
            num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        )
    }
}));

// Mock CSS modules
jest.mock('./component.module.scss', () => ({
    'container': 'container-class',
    'button': 'button-class'
}));
```

### 2. 服務 Mock

```typescript
// Mock 服務類
jest.mock('../../src/services/api-service');

const mockApiService = {
    fetchData: jest.fn().mockResolvedValue({ data: 'test' })
};

(ApiService as jest.Mock).mockImplementation(() => mockApiService);
```

## 測試最佳實踐

### 1. 測試命名

- 使用描述性的測試名稱
- 遵循 "should [expected behavior] when [condition]" 格式
- 分組相關測試使用 `describe` 區塊

### 2. 測試覆蓋率

- 目標覆蓋率：至少 80%
- 重點測試業務邏輯和用戶交互
- 包含邊界條件和錯誤情況

### 3. 測試隔離

- 每個測試應該獨立運行
- 使用 `beforeEach` 重置狀態
- 避免測試間的依賴

### 4. 斷言

```typescript
// 推薦的斷言方式
expect(element).toBeInTheDocument();
expect(element).toHaveClass('expected-class');
expect(mockFunction).toHaveBeenCalledWith(expectedArgs);
expect(value).toBe(expectedValue);
```

## 常見測試模式

### 1. 組件渲染測試

```typescript
it('should render with correct props', () => {
    render(<Component prop="value" />);
    expect(screen.getByText('expected')).toBeInTheDocument();
});
```

### 2. 事件處理測試

```typescript
it('should handle click events', () => {
    const mockHandler = jest.fn();
    render(<Component onClick={mockHandler} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockHandler).toHaveBeenCalled();
});
```

### 3. useEffect 測試

```typescript
it('should call effect when dependencies change', () => {
    const mockEffect = jest.fn();
    const { rerender } = render(<Component prop="initial" />);
    
    rerender(<Component prop="changed" />);
    expect(mockEffect).toHaveBeenCalledTimes(2);
});
```

## 調試測試

### 1. 使用 console.log

```typescript
it('should debug test', () => {
    const result = someFunction();
    console.log('Result:', result);
    expect(result).toBe(expected);
});
```

### 2. 使用 debug()

```typescript
it('should debug component', () => {
    const { debug } = render(<Component />);
    debug(); // 輸出組件的 HTML
});
```

### 3. 使用 screen.debug()

```typescript
it('should debug specific element', () => {
    render(<Component />);
    screen.debug(screen.getByRole('button'));
});
```

## 持續集成

在 CI/CD 流程中：

```yaml
# 示例 GitHub Actions
- name: Run tests
  run: nx test hot-league-wall --coverage --watchAll=false

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## 故障排除

### 常見問題

1. **Mock 不工作**
   - 確保 mock 在 import 之前設置
   - 檢查 mock 路徑是否正確

2. **測試環境問題**
   - 確保 `jest.setup.ts` 正確配置
   - 檢查 `jest.config.ts` 設置

3. **覆蓋率報告問題**
   - 確保測試文件路徑正確
   - 檢查 `.gitignore` 是否排除了測試文件 