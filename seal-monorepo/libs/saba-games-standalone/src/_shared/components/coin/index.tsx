import emptyImage from "../../../assets/coin/empty.png"
import headImage from "../../../assets/coin/head.png"
import tailImage from "../../../assets/coin/tail.png"
import { Size } from "../../../_shared/constants";
import styles from "./coin.module.scss"

export enum CoinSymbol {
  EMPTY = -1,
  HEAD = 0,
  TAIL = 1,
}

const coinImages: Record<CoinSymbol, string> = {
  [CoinSymbol.EMPTY]: emptyImage,
  [CoinSymbol.HEAD]: headImage,
  [CoinSymbol.TAIL]: tailImage,
}

interface ICoinProps {
  coinType: CoinSymbol;
  size?: typeof Size.large | typeof Size.medium | typeof Size.small;
}

const Coin: React.FC<ICoinProps> = ({ coinType, size = Size.medium }) => {
  const coinImageUrl = coinImages[coinType];

  return <img className={styles[`coin-${size}`]} src={coinImageUrl} alt={`coin-${coinType}`} />
}

export default Coin;