import styles from './hot-league-wall.module.scss';
import Sedie from '../assets/sedie.png';
import Arrow from '../assets/arrow.svg';

export function HotLeagueWall() {
  return (
    <div className={styles['container']}>
      <h1>Welcome to HotLeagueWall!</h1>
      <div>
        <h2>Assets Demo</h2>
        PNG : <img src={Sedie} alt="Sedie" />
        SVG: <Arrow />
      </div>
    </div>
  );
}

export default HotLeagueWall;
