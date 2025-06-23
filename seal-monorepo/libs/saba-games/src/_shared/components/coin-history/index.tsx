import classNames from "classnames";
import { CoinSymbol } from "../coin"
import Styles from "./coin.module.scss"
import { Size } from "../../../_shared/constants";

interface ICoinProps {
  coinType: CoinSymbol;
  size?: string;
}

const StylesTypeMap = {
  [CoinSymbol.HEAD]: Styles[`dot-head`],
  [CoinSymbol.TAIL]: Styles[`dot-tail`],
  [CoinSymbol.EMPTY]: Styles[`dot-next`],
}

const CoinHistory: React.FC<ICoinProps> = ({ coinType, size = Size.small }) => {
  const classNameStyle = StylesTypeMap[coinType];
  
  const value = coinType === CoinSymbol.EMPTY ? '?' : '';

  return (
    <div
        className={classNames(
            Styles.dot,
            Styles[`dot-${size}`],
            classNameStyle,
        )}
        data-testid='round-dot'
    >
      { value }
    </div>
  )
}

export default CoinHistory;