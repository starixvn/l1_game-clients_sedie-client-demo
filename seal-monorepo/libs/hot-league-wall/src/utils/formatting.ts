export const addCommas = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const formatNumber = (num: number): string => {
    if (num >= 1000) {
        return (num / 1000).toString() + 'K';
    }
    return num.toString();
};

export const calculatePayout = (amount: number, odd: number): string => {
    return amount > 0 ? addCommas(amount * odd) : '0.00';
}; 