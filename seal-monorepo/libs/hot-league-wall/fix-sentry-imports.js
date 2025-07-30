// Script to fix all remaining sentryHelper imports in app-settings/index.ts
// Run this script to replace all remaining sentryHelper calls

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/_shared/app-settings/index.ts');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Replace all remaining sentryHelper calls
const replacements = [
    // Line 186
    {
        from: `    sentryHelper.logInfo(componentName, 'Site configuration retrieved successfully', {`,
        to: `    logInfo(componentName, 'Site configuration retrieved successfully', {`,
    },
    // Line 199
    {
        from: `    sentryHelper.logInfo(componentName, 'Getting game setting', {`,
        to: `    logInfo(componentName, 'Getting game setting', {`,
    },
    // Line 207
    {
        from: `        sentryHelper.logWarning(componentName, 'No settings found for gameId', {`,
        to: `        logWarning(componentName, 'No settings found for gameId', {`,
    },
    // Line 216
    {
        from: `    sentryHelper.logInfo(componentName, 'Game setting retrieved successfully', {`,
        to: `    logInfo(componentName, 'Game setting retrieved successfully', {`,
    },
    // Line 230
    {
        from: `    sentryHelper.logInfo(componentName, 'Getting game setting IDs', {`,
        to: `    logInfo(componentName, 'Getting game setting IDs', {`,
    },
    // Line 247
    {
        from: `    sentryHelper.logInfo(componentName, 'Game setting IDs retrieved successfully', {`,
        to: `    logInfo(componentName, 'Game setting IDs retrieved successfully', {`,
    },
    // Line 261
    {
        from: `    sentryHelper.logInfo(componentName, 'Getting visible game settings', {`,
        to: `    logInfo(componentName, 'Getting visible game settings', {`,
    },
    // Line 273
    {
        from: `    sentryHelper.logInfo(componentName, 'Visible game settings retrieved successfully', {`,
        to: `    logInfo(componentName, 'Visible game settings retrieved successfully', {`,
    },
];

// Apply all replacements
replacements.forEach((replacement) => {
    content = content.replace(replacement.from, replacement.to);
});

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ All sentryHelper imports have been fixed!');
console.log('The following replacements were made:');
replacements.forEach((replacement, index) => {
    console.log(`${index + 1}. ${replacement.from.split('(')[0]} -> ${replacement.to.split('(')[0]}`);
});
