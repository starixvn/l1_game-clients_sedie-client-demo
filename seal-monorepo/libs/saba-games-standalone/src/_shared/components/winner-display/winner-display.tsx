import Style from "./winner-display.module.scss";

export type IWinnerDisplayProps = {
    resultText: string;
    className?: string;
};

export const WinnerDisplay: React.FC<IWinnerDisplayProps> = (props) => {
    const { resultText, className } = props;
    return (
        <div className={`${Style['winner-display']} ${className}`}>
            <p className={Style['winner-text']}>{resultText}</p>
        </div>
    );
};
