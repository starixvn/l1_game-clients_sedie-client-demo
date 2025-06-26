import Styles from './reconnecting.module.scss';
import blurBgGame from '../../../assets/rng-soccer/blur-bg-game.png';

export const Loading: React.FC = () => {
    return (
        <div className={Styles['reconnecting-container']}>
            <img src={blurBgGame} alt="Blurred background" />
            <div className={Styles['dot-elastic']}></div>
        </div>
    );
};

export default Loading;
