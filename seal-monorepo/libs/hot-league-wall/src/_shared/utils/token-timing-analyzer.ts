/**
 * Token Timing Analyzer Utility
 * 
 * This utility helps analyze the timing logs generated during token requests
 * when the user clicks the Play button in the RNG Soccer prototype.
 */

export interface TokenTimingData {
    timestamp: string;
    component: string;
    action: string;
    duration?: number;
    status: 'start' | 'success' | 'error' | 'info';
    message: string;
}

export class TokenTimingAnalyzer {
    private timingLogs: TokenTimingData[] = [];
    private sessionStartTime: number;

    constructor() {
        this.sessionStartTime = performance.now();
        console.log('🔍 [TIMING_ANALYZER] Token timing analyzer initialized');
    }

    /**
     * Add a timing log entry
     */
    addLog(component: string, action: string, status: 'start' | 'success' | 'error' | 'info', message: string, duration?: number): void {
        const log: TokenTimingData = {
            timestamp: new Date().toISOString(),
            component,
            action,
            duration,
            status,
            message
        };

        this.timingLogs.push(log);

        // Also log to console for immediate visibility
        const emoji = this.getStatusEmoji(status);
        const durationText = duration ? ` (${duration.toFixed(2)}ms)` : '';
        console.log(`${emoji} [${component.toUpperCase()}] ${action}${durationText}: ${message}`);
    }

    /**
     * Get emoji for status
     */
    private getStatusEmoji(status: string): string {
        switch (status) {
            case 'start': return '🕐';
            case 'success': return '✅';
            case 'error': return '💥';
            case 'info': return 'ℹ️';
            default: return '📝';
        }
    }

    /**
     * Analyze the complete token request flow
     */
    analyzeTokenFlow(): void {
        console.log('\n📊 [TIMING_ANALYZER] === TOKEN REQUEST FLOW ANALYSIS ===');

        const playButtonClicks = this.timingLogs.filter(log =>
            log.action === 'Play button clicked' && log.status === 'start'
        );

        const tokenRequests = this.timingLogs.filter(log =>
            log.action === 'Token request' && log.status === 'start'
        );

        const tokenSuccesses = this.timingLogs.filter(log =>
            log.action === 'Token request' && log.status === 'success'
        );

        const tokenErrors = this.timingLogs.filter(log =>
            log.action === 'Token request' && log.status === 'error'
        );

        console.log(`🎯 Total Play button clicks: ${playButtonClicks.length}`);
        console.log(`🔄 Total token requests: ${tokenRequests.length}`);
        console.log(`✅ Successful token requests: ${tokenSuccesses.length}`);
        console.log(`💥 Failed token requests: ${tokenErrors.length}`);

        // Calculate average token request time
        if (tokenSuccesses.length > 0) {
            const totalDuration = tokenSuccesses.reduce((sum, log) => sum + (log.duration || 0), 0);
            const averageDuration = totalDuration / tokenSuccesses.length;
            console.log(`⏱️ Average token request time: ${averageDuration.toFixed(2)}ms`);
        }

        // Find the fastest and slowest token requests
        if (tokenSuccesses.length > 0) {
            const fastest = tokenSuccesses.reduce((min, log) =>
                (log.duration || 0) < (min.duration || 0) ? log : min
            );
            const slowest = tokenSuccesses.reduce((max, log) =>
                (log.duration || 0) > (max.duration || 0) ? log : max
            );

            console.log(`🚀 Fastest token request: ${fastest.duration?.toFixed(2)}ms at ${fastest.timestamp}`);
            console.log(`🐌 Slowest token request: ${slowest.duration?.toFixed(2)}ms at ${slowest.timestamp}`);
        }

        // Analyze component timing breakdown
        this.analyzeComponentTiming();

        console.log('📊 [TIMING_ANALYZER] === END ANALYSIS ===\n');
    }

    /**
     * Analyze timing breakdown by component
     */
    private analyzeComponentTiming(): void {
        console.log('\n🔍 [TIMING_ANALYZER] Component Timing Breakdown:');

        const components = ['BASE', 'PROTOTYPE', 'APP', 'TOKEN'];

        components.forEach(component => {
            const componentLogs = this.timingLogs.filter(log =>
                log.component.toUpperCase() === component
            );

            if (componentLogs.length > 0) {
                const totalDuration = componentLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
                const averageDuration = totalDuration / componentLogs.length;
                console.log(`  ${component}: ${averageDuration.toFixed(2)}ms average (${componentLogs.length} logs)`);
            }
        });
    }

    /**
     * Get timing logs for a specific session
     */
    getTimingLogs(): TokenTimingData[] {
        return [...this.timingLogs];
    }

    /**
     * Clear all timing logs
     */
    clearLogs(): void {
        this.timingLogs = [];
        console.log('🧹 [TIMING_ANALYZER] Timing logs cleared');
    }

    /**
     * Export timing data as JSON
     */
    exportTimingData(): string {
        const exportData = {
            sessionStartTime: this.sessionStartTime,
            totalDuration: performance.now() - this.sessionStartTime,
            logs: this.timingLogs,
            summary: {
                totalLogs: this.timingLogs.length,
                successfulTokenRequests: this.timingLogs.filter(log =>
                    log.action === 'Token request' && log.status === 'success'
                ).length,
                failedTokenRequests: this.timingLogs.filter(log =>
                    log.action === 'Token request' && log.status === 'error'
                ).length
            }
        };

        return JSON.stringify(exportData, null, 2);
    }
}

// Global instance for easy access
export const tokenTimingAnalyzer = new TokenTimingAnalyzer();

// Auto-analyze on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        tokenTimingAnalyzer.analyzeTokenFlow();
    });
}

// Export convenience functions
export const logTokenTiming = (
    component: string,
    action: string,
    status: 'start' | 'success' | 'error' | 'info',
    message: string,
    duration?: number
) => {
    tokenTimingAnalyzer.addLog(component, action, status, message, duration);
};

export const analyzeTokenTiming = () => {
    tokenTimingAnalyzer.analyzeTokenFlow();
};

export const exportTokenTimingData = () => {
    return tokenTimingAnalyzer.exportTimingData();
}; 