/**
 * 將秒數轉換為 MM:SS 格式
 * @param seconds 總秒數
 * @returns 格式化後的時間字符串 (MM:SS)
 */
export const formatSecondsToTime = (seconds: number): string => {
    const validSeconds = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(validSeconds / 60);
    const remainingSeconds = validSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * 將秒數轉換為純秒數格式
 * @param seconds 總秒數
 * @returns 格式化後的秒數字符串
 */
export const formatSecondsOnly = (seconds: number): string => {
    const validSeconds = Math.max(0, Math.floor(seconds));
    return validSeconds.toString().padStart(2, '0');
}; 