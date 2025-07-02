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
    }

    /**
     * Analyze Prototype → Real App transition timing
     */
    private analyzeTransitionTiming(): void {
    }

    /**
     * Analyze timing breakdown by component
     */
    private analyzeComponentTiming(): void {
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