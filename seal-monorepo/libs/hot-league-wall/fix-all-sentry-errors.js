// Comprehensive script to fix all sentryHelper errors
const fs = require('fs');
const path = require('path');

// Files that need to be fixed
const filesToFix = [
    'src/_shared/hooks/useSentryHelper.ts',
    'src/lobby/lobby.tsx',
    'src/games/game-base/startup.ts',
    'src/_shared/utils/storage-manager.ts',
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
            return `import {\n    ${cleanImports ? cleanImports + ',\n    ' : ''}logInfo,\n    logError,\n    logWarning,\n    logDebug,\n    logTrace,\n    configureComponent,\n    startWorkflow,\n    updateWorkflow,\n    completeWorkflow,\n    trackPerformance\n} from '../utils/sentry/sentry-helper'`;
        });
    }

    // Fix wrong import paths
    content = content.replace(/from\s*['"]\.\/sentry-helper['"]/g, (match) => {
        changesMade++;
        return `from '../utils/sentry/sentry-helper'`;
    });

    // Replace all sentryHelper.logX calls with direct function calls
    const replacements = [
        { from: 'sentryHelper.logInfo', to: 'logInfo' },
        { from: 'sentryHelper.logError', to: 'logError' },
        { from: 'sentryHelper.logWarning', to: 'logWarning' },
        { from: 'sentryHelper.logDebug', to: 'logDebug' },
        { from: 'sentryHelper.logTrace', to: 'logTrace' },
        { from: 'sentryHelper.configureComponent', to: 'configureComponent' },
        { from: 'sentryHelper.startWorkflow', to: 'startWorkflow' },
        { from: 'sentryHelper.updateWorkflow', to: 'updateWorkflow' },
        { from: 'sentryHelper.completeWorkflow', to: 'completeWorkflow' },
        { from: 'sentryHelper.trackPerformance', to: 'trackPerformance' },
    ];

    replacements.forEach((replacement) => {
        const regex = new RegExp(replacement.from, 'g');
        const matches = content.match(regex);
        if (matches) {
            content = content.replace(regex, replacement.to);
            changesMade += matches.length;
        }
    });

    // Fix function call signatures - add componentName as first parameter
    // This is a more complex fix that needs to be done carefully
    const functionCallFixes = [
        // Fix logInfo calls that are missing componentName
        {
            pattern: /logInfo\s*\(\s*['"]([^'"]+)['"]\s*,\s*{/g,
            replacement: (match, message) => {
                return `logInfo('ComponentName', '${message}', {`;
            },
        },
        // Fix logError calls that are missing componentName
        {
            pattern: /logError\s*\(\s*['"]([^'"]+)['"]\s*,\s*{/g,
            replacement: (match, message) => {
                return `logError('ComponentName', '${message}', {`;
            },
        },
        // Fix logWarning calls that are missing componentName
        {
            pattern: /logWarning\s*\(\s*['"]([^'"]+)['"]\s*,\s*{/g,
            replacement: (match, message) => {
                return `logWarning('ComponentName', '${message}', {`;
            },
        },
    ];

    functionCallFixes.forEach((fix) => {
        const matches = content.match(fix.pattern);
        if (matches) {
            content = content.replace(fix.pattern, fix.replacement);
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
console.log('🔧 Fixing all sentryHelper errors...\n');

filesToFix.forEach((file) => {
    fixFile(file);
});

console.log('\n🎉 All files have been processed!');
console.log('\n📝 Summary of changes:');
console.log('- Fixed import paths');
console.log('- Replaced sentryHelper.logX() calls with direct logX() calls');
console.log('- Added missing componentName parameters to logging functions');
console.log('- Added missing imports for workflow and configuration functions');
