# Hot League Wall

This library was generated with [Nx](https://nx.dev).

## Development Guide

### Working Directory

```bash
# Switch to working directory
cd seal-monorepo
```

### Environment Setup

```bash
# Install dependencies
npm install
```

### Development Workflow

1. Start Development Server

```bash
nx serve hot-league-wall
```

Development server will start at http://localhost:4551 (configured in webpack.dev.js)

2. Code Linting

```bash
nx lint hot-league-wall
```

### Testing

Run unit tests:

```bash
nx test hot-league-wall
```

Update test snapshots:

```bash
nx test hot-league-wall --update-snapshot
```

### Build & Deployment

This library is part of the @seal-components package. To build the entire package can to found in [README.md](../../README.md) under `seal-monorepo`

## Project Structure

```
hot-league-wall/
├── src/                # Source code directory
├── preview-template/   # Development preview template
├── webpack.dev.js     # Webpack development configuration
├── project.json       # Nx project configuration
├── tsconfig.json      # TypeScript configuration
└── README.md         # Project documentation
```

## Important Notes

-   Run tests and lint checks before committing
-   For any issues, refer to Nx documentation or contact team members
-   This library is built as part of @seal-components package

## Related Documentation

-   [Nx Documentation](https://nx.dev)
-   [Jest Documentation](https://jestjs.io)
-   [@seal-components Documentation](../../README.md)
