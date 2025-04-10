# Se Die Frontend Development Guide

## Table of Contents
- [Overview](#overview)
- [Development Workflow](#development-workflow)
- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Project Structure](#project-structure)
  - [Preview Template Resources](#preview-template-resources)
  - [Vgaming Project Structure](#vgaming-project-structure)
  - [Game Configuration](#game-configuration)
  - [Version Packaging](#version-packaging)
- [Installation Troubleshooting](#installation-troubleshooting)
  - [Building for Production](#building-for-production-command)
- [Release](#release)
  - [seal-components Update Steps](#seal-components-update-steps)

## Overview

This guide provides instructions for frontend developers working on the Se Die game integration. It covers setup, development workflow and key components.

Development Note:  
1. This project is developed using NX (https://nx.dev/)  
2. <span style="color: #ff6b6b; font-weight: bold; font-size: 1.1em;">It contains multiple projects, but we only need to work on saba-games and vgaming.</span>
3. Other projects are not in our development scope.

Project Paths:
- `seal-monorepo/libs/saba-games`
- `seal-monorepo/libs/vgaming`

<img src="./saba-games-project-path.png" width="360" height="580">

## Development Workflow
1. **Develop**  
   ⬇️
2. **Test**  
   ⬇️
3. **Complete Development**  
   ⬇️
4. **Update app-settings**  
   ⬇️
5. **Sync saba-games code to vgaming**  
   ⬇️
6. **Versioning**  
   ⬇️
7. **Packaging & Deploy (handled by OneLab)**  

> <span style="color: #ff4500; font-weight: bold; font-size: 1.1em;">⚠️ Note:</span>
> - <span style="color: orange;">Steps 1 to 6 are a joint effort by OneLab and Pentagon.</span>
> - <span style="color: orange;">Step 7 (Packaging and Deployment) is handled by OneLab.</span>

## Prerequisites

- **Node.js** <span style="color: #89C4F4;">(v18)</span>
- **Yarn** <span style="color: #89C4F4;">(version 1.22.22)</span>
- Basic knowledge of **TypeScript** and **React**
- Access to the project repository

## Project Setup

1. **Clone and start Saba Games**:
   ```bash
   git clone [repository-url]
   cd seal-monorepo
   yarn install
   nx serve saba-games
   (nx serve vgaming)
   ```
   > This command sets up the development environment for Saba Games.

2. **Access the development environment** at `http://localhost:4200`

<br />

## Project Structure

```
saba-games/
├── src/                    # Source code
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── configs/                # Configuration files
├── constant/               # Constants and enums
└── preview-template/       # Preview templates
```

<br />

### Preview Template Resources

The `preview-template` folder contains all styling configurations for the modernized color scheme used by the member site (Nova 88 platform).

> **Note**: These templates are intended for development purposes only and should not be included in the production build.

<br />

### Vgaming Project Structure

`vgaming` is a separate project from `saba-games`. It contains the same code structure, except for the `app-settings` which are specific to each project:

```
vgaming/
├── src/                    # Source code
├── constant/               # Constants and enums
└── preview-template/       # Preview templates
```

In the next phase, the projects should be integrated into a single project, as long as the different `app-settings` can be distinguished when referencing the project.

<br />

### Game Configuration
> **⚠️ Important Note**: 
> 
> Before bundling the project for UAT or PROD environments, you must manually modify the environment setting from `APP_ENV.LOCAL` to `APP_ENV.UAT` or `APP_ENV.PROD` respectively. This is currently the only way to change environment configurations.
> - `seal-monorepo/libs/saba-games/src/_shared/app-settings/index.ts`
> - `seal-monorepo/libs/vgaming/src/_shared/app-settings/index.ts`

> - **APP_ENV.LOCAL**: Used for local development and testing.
> - **APP_ENV.UAT**: Used for User Acceptance Testing environments.
> - **APP_ENV.PROD**: Used for production environments.

- For **Saba Games** platform, use `VIVA88_SITE_ID`:
  ```typescript
  export const appSettings = getEnvironmentConfig({
      appEnv: APP_ENV.LOCAL,  // Change to APP_ENV.UAT or APP_ENV.PROD as needed
      siteId: VIVA88_SITE_ID  // Identifies Saba Games platform
  });
  ```

- For **Vgaming** platform, use `NOVA88_SITE_ID`:
  ```typescript
  export const appSettings = getEnvironmentConfig({
      appEnv: APP_ENV.LOCAL,  // Change to APP_ENV.UAT or APP_ENV.PROD as needed
      siteId: NOVA88_SITE_ID  // Identifies Vgaming platform
  });
  ```

### Version Packaging

Before packaging the version number, execute the following command:
```bash
1. Copy all the files from saba-games to vgaming
```bash
cd seal-monorepo
cp -R libs/saba-games/* libs/vgaming/ 
```
```bash
2. Adjust the app-settings/index.ts file
# saba-games ->  app-settings (siteId: VIVA88_SITE_ID, appEnv: APP_ENV.LOCAL | APP_ENV.UAT | APP_ENV.PROD)
# vgaming ->  app-settings (siteId: NOVA88_SITE_ID, appEnv: APP_ENV.LOCAL | APP_ENV.UAT | APP_ENV.PROD)
```

<br />

### Building for Production command
```bash
cd seal-monorepo
nx run seal-components:build
# or npx nx run seal-components:build
# Ensure the build runs successfully
```


## Installation Troubleshooting

If you encounter installation or packaging issues with sg/sg-game-client

You might see errors like:
```
npm ERR! 404 Not Found - GET https://registry.npmjs.org/@sg%2fsg-game-client - Not found
npm ERR! 404 
npm ERR! 404  '@sg/sg-game-client@1.0.6' is not in this registry.
```

This occurs because sg/sg-game-client is an internal package provided by the Vietnam Team. Please try the following steps:

1. Modify registry:  
```bash
npm set registry http://npm.lumigame.com
```

2. Install using yarn (in /seal-monorepo directory):
```bash
yarn install
```

After successful installation/packaging, remember to restore the registry:

3. Restore npm registry:  
```bash
npm set registry https://registry.npmjs.org/
```


 
<h2 style="color: orange;"> Below For OneLab Use </h2>


## Release
Currently, the packaged files are placed in another external project:
- seal-components
- member-site

### seal-components Update Steps

1. Confirm that seal-components is cloned
    https://git.owgps.net/seal/seal-components

2. Run the following command to automatically update artifacts to seal-components branch: `npm-release`
  ```
  npx nx run seal-components:release 
  ```
  If you want to manage version numbers manually, update the version then run build and publish
  ```
  // 1. Version numbering
  // Automatic versioning
  npx nx run seal-components:version
  // Update only the rightmost version number
  npx nx run seal-components:version:patch
  // Custom version suffix (suitable for testing releases before final confirmation)
  npx nx run seal-components:version --prerelease ${custom_suffix}

  // 2. build
  npx nx run seal-components:build

  // 3. Publish to seal-components project
  npx nx run seal-components:publish
  ```
3. After internal testing is complete, manually create a version tag in the seal-components project: `npm-release-1.2.0`, the version should match package.json


Since seal-components is used by member-site, you need to manually create version tags in the seal-components project and update the version in member-site.


### seal-components Update Steps

To update the version in member-site:
1. Navigate to front-end/WidgetDev/package.json
2. update the new version by updating the dependency:
```
"seal-components": "git+https://npm:sh64wvZzX2ZrrtDXQuiL@git.owgps.net/seal/seal-components.git#npm-release-1.30.0-vg-sg.8",
```
3. Run yarn install


```
│ dev-seal-components ├─────►│ seal-components ├────►│ member-site  │  
    (Development)       ───►    (Bundle/Deploy) ───►  (NPM Package)
```



