const formatOdds = (value: number | string, isFractionalFormat = false, decimalPlaces = 2) => {
    return isFractionalFormat
        ? `${numberWithCommas(+value - 1, 2, decimalPlaces)}:1`
        : `1:${numberWithCommas(+value, 2, decimalPlaces)}`;
};

const numberWithCommas = (number: number, toFixed = 2, minimumFractionDigits = 0) => {
    const options = { maximumFractionDigits: toFixed } as any;
    if (number % parseInt(number.toString()) !== 0) {
        options.minimumFractionDigits = minimumFractionDigits;
    }
    return number.toLocaleString('en-US', options);
};

export { formatOdds };
