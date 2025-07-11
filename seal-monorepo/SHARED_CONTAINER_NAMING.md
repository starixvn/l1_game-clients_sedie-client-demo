# Shared Container Naming Strategy

## Overview

To prevent conflicts when both `hot-league-wall` and `saba-games` run simultaneously, each project now uses unique window property names for their shared containers.

## Container Names

### Saba Games
- **Window Property**: `window.saba_games_shared_container`
- **Source File**: `seal-monorepo/libs/saba-games/src/_shared/components/game-base/startup.ts`
- **Connection Manager**: `seal-monorepo/libs/saba-games/src/_shared/components/game-base/connection-manager.ts`

### Hot League Wall
- **Window Property**: `window.hot_league_wall_shared_container`
- **Source File**: `seal-monorepo/libs/hot-league-wall/src/games/game-base/startup.ts`
- **Connection Manager**: `seal-monorepo/libs/hot-league-wall/src/games/game-base/gateway/gateway-connection-manager.ts`

## Fallback Strategy

Both connection managers use the same fallback strategy, but with their respective unique container names:

### Saba Games ConnectionManager
```typescript
const sources = [
    sharedContainer,                    // 1. Imported from startup
    window['saba_games_shared_container'], // 2. Project-specific container
    (gc as any).sharedContainer,       // 3. GC shared container
    (window as any).sharedContainer    // 4. Generic window container
];
```

### Hot League Wall GatewayConnectionManager
```typescript
const sources = [
    sharedContainer,                        // 1. Imported from startup
    window['hot_league_wall_shared_container'], // 2. Project-specific container
    (gc as any).sharedContainer,           // 3. GC shared container
    (window as any).sharedContainer        // 4. Generic window container
];
```

## Benefits

1. **No Conflicts**: Each project has its own isolated container space
2. **Independent Operation**: Projects can run simultaneously without interference
3. **Clear Ownership**: Easy to identify which container belongs to which project
4. **Backward Compatibility**: Still maintains fallback to generic containers

## Migration Notes

- Old references to `window.seal_shared_container` have been updated
- Test files updated to use project-specific container names
- Documentation updated to reflect new naming convention
- External applications should use the appropriate project-specific container name

## External Integration

When integrating these libraries into external applications, use the appropriate container name:

```javascript
// For Saba Games integration
const sabaContainer = window.saba_games_shared_container;

// For Hot League Wall integration
const hotLeagueContainer = window.hot_league_wall_shared_container;
``` 