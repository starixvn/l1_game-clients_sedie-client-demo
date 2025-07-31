## Quick Start

### Enable Info Logging (Recommended for Production Debugging)

```javascript
// Enable info level logging
localStorage.setItem('hot-league-wall-debug-enabled', 'true');
localStorage.setItem('sentry_log_level', 'info');

// Reload the page to apply changes
location.reload();
```

### Enable Error/Fatal Logging (Enables Session Replay)

```javascript
// Enable error and fatal logging (also enables Session Replay)
localStorage.setItem('hot-league-wall-debug-enabled', 'true');
localStorage.setItem('sentry_log_level', 'error');

// Reload the page to apply changes
location.reload();
```

### Disable All Logging

```javascript
// Disable all logging except error/fatal
localStorage.setItem('hot-league-wall-debug-enabled', 'false');

// Reload the page to apply changes
location.reload();
```
