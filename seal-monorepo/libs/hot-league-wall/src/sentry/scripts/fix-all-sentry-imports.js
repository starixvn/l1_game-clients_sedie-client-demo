// Comprehensive script to fix all sentryHelper imports across all affected files
const fs = require('fs');
const path = require('path');

// Files that need to be fixed
const filesToFix = [
    'src/_shared/utils/sentry/sentry-helper-examples.ts',
    'src/lobby/lobby.tsx',
    'src/games/game-base/startup.ts',
    'src/_shared/utils/storage-manager.ts',
    'src/_shared/hooks/useSentryHelper.ts',
    'src/_shared/app-settings/index.ts',
];

// Function to fix a single file
function fixFile(filePath) {
    const fullPath = path.join(__dirname, filePath);

    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let changesMade = 0;

    // Fix import statements
    if (content.includes('import { sentryHelper }')) {
        content = content.replace(/import\s*{\s*sentryHelper\s*,?\s*([^}]*)\s*}\s*from\s*['"][^'"]*['"]/g, (match, otherImports) => {
            changesMade++;
            const cleanImports = otherImports.replace(/,\s*$/, '').trim();
            return `import {\n    ${cleanImports ? cleanImports + ',\n    ' : ''}logInfo,\n    logError,\n    logWarning,\n    logDebug,\n    logTrace\n} from '@/sentry/sentry-helper'`;
        });
    }

    // Replace all sentryHelper.logX calls with direct function calls
    const replacements = [
        { from: 'sentryHelper.logInfo', to: 'logInfo' },
        { from: 'sentryHelper.logError', to: 'logError' },
        { from: 'sentryHelper.logWarning', to: 'logWarning' },
        { from: 'sentryHelper.logDebug', to: 'logDebug' },
        { from: 'sentryHelper.logTrace', to: 'logTrace' },
    ];

    replacements.forEach((replacement) => {
        const regex = new RegExp(replacement.from, 'g');
        const matches = content.match(regex);
        if (matches) {
            content = content.replace(regex, replacement.to);
            changesMade += matches.length;
        }
    });

    // Write the file back if changes were made
    if (changesMade > 0) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Fixed ${filePath} (${changesMade} changes)`);
    } else {
        console.log(`ℹ️  No changes needed for ${filePath}`);
    }
}

// Fix all files
console.log('🔧 Fixing all sentryHelper imports...\n');

filesToFix.forEach((file) => {
    fixFile(file);
});

console.log('\n🎉 All files have been processed!');
console.log('\n📝 Summary of changes:');
console.log('- Replaced "import { sentryHelper }" with individual function imports');
console.log('- Replaced "sentryHelper.logX()" calls with direct "logX()" calls');
console.log('- Added missing imports for logInfo, logError, logWarning, logDebug, logTrace');
