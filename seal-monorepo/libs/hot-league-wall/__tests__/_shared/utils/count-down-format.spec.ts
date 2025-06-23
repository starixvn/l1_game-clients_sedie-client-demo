import { formatSecondsToTime, formatSecondsOnly } from '../../../src/_shared/utils/count-down-format';

describe('count-down-format', () => {
    describe('formatSecondsToTime', () => {
        it('should format seconds to MM:SS format correctly', () => {
            const result = formatSecondsToTime(125);
            expect(result).toBe('02:05');
        });

        it('should handle zero seconds', () => {
            const result = formatSecondsToTime(0);
            expect(result).toBe('00:00');
        });

        it('should handle seconds less than 60', () => {
            const result = formatSecondsToTime(45);
            expect(result).toBe('00:45');
        });

        it('should handle exactly 60 seconds', () => {
            const result = formatSecondsToTime(60);
            expect(result).toBe('01:00');
        });

        it('should handle negative numbers by returning 00:00', () => {
            const result = formatSecondsToTime(-30);
            expect(result).toBe('00:00');
        });

        it('should handle decimal numbers by truncating decimal part', () => {
            const result = formatSecondsToTime(65.7);
            expect(result).toBe('01:05');
        });

        it('should handle decimal numbers with large decimal part', () => {
            const result = formatSecondsToTime(125.999);
            expect(result).toBe('02:05');
        });

        it('should handle decimal numbers that round down', () => {
            const result = formatSecondsToTime(59.9);
            expect(result).toBe('00:59');
        });

        it('should handle edge cases with single digit minutes and seconds', () => {
            const result = formatSecondsToTime(61);
            expect(result).toBe('01:01');
        });

        it('should handle edge cases with double digit minutes and seconds', () => {
            const result = formatSecondsToTime(1259);
            expect(result).toBe('20:59');
        });

        it('should handle large numbers of seconds', () => {
            const result = formatSecondsToTime(3661);
            expect(result).toBe('61:01');
        });

        it('should handle very large numbers', () => {
            const result = formatSecondsToTime(9999);
            expect(result).toBe('166:39');
        });
    });

    describe('formatSecondsOnly', () => {
        it('should format seconds with leading zero when less than 10', () => {
            const result = formatSecondsOnly(5);
            expect(result).toBe('05');
        });

        it('should format seconds without leading zero when 10 or greater', () => {
            const result = formatSecondsOnly(15);
            expect(result).toBe('15');
        });

        it('should handle zero seconds', () => {
            const result = formatSecondsOnly(0);
            expect(result).toBe('00');
        });

        it('should handle double digit seconds', () => {
            const result = formatSecondsOnly(59);
            expect(result).toBe('59');
        });

        it('should handle large numbers', () => {
            const result = formatSecondsOnly(123);
            expect(result).toBe('123');
        });

        it('should handle negative numbers by returning 00', () => {
            const result = formatSecondsOnly(-5);
            expect(result).toBe('00');
        });

        it('should handle decimal numbers by truncating decimal part', () => {
            const result = formatSecondsOnly(5.7);
            expect(result).toBe('05');
        });

        it('should handle decimal numbers with large decimal part', () => {
            const result = formatSecondsOnly(15.999);
            expect(result).toBe('15');
        });

        it('should handle decimal numbers that round down', () => {
            const result = formatSecondsOnly(9.9);
            expect(result).toBe('09');
        });

        it('should handle edge case with exactly 10', () => {
            const result = formatSecondsOnly(10);
            expect(result).toBe('10');
        });
    });
}); 