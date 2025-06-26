#!/usr/bin/env node

/**
 * Test script to verify environment variables are working
 * Run this with: node test-env-vars.js
 */

console.log('🔍 Testing Environment Variables...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('SIMULATOR_CONFIG:', process.env.SIMULATOR_CONFIG);

if (process.env.SIMULATOR_CONFIG) {
    try {
        // The JSON might be coming in without quotes, so let's try to fix it
        let configString = process.env.SIMULATOR_CONFIG;

        // If it doesn't start with a quote, it might be malformed
        if (!configString.startsWith('"') && !configString.startsWith('{')) {
            console.log('⚠️ SIMULATOR_CONFIG appears to be malformed, attempting to fix...');
            // Try to reconstruct the JSON
            configString = configString.replace(/(\w+):/g, '"$1":');
            configString = configString.replace(/:(\w+)/g, ':"$1"');
            console.log('🔧 Fixed config string:', configString);
        }

        const config = JSON.parse(configString);
        console.log('✅ SIMULATOR_CONFIG parsed successfully:', config);

        const shouldShow = config.simulationMode?.enabled && config.simulatorConfigs?.enabled;
        console.log('Should show SSO controls:', shouldShow);

        // Test the actual logic
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ NODE_ENV is development');
            if (shouldShow) {
                console.log('✅ SSO controls should be SHOWN');
            } else {
                console.log('✅ SSO controls should be HIDDEN');
            }
        } else {
            console.log('❌ NODE_ENV is not development, SSO controls will be hidden');
        }
    } catch (error) {
        console.error('❌ Failed to parse SIMULATOR_CONFIG:', error.message);
        console.log('Raw SIMULATOR_CONFIG value:', JSON.stringify(process.env.SIMULATOR_CONFIG));
    }
} else {
    console.log('❌ SIMULATOR_CONFIG not found');
}

console.log(
    'All environment variables:',
    Object.keys(process.env).filter((key) => key.includes('SIMULATOR') || key.includes('NODE_ENV')),
);
