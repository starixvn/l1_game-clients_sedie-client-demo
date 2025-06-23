import React from 'react';
import './index.scss';
import liveIcon from '../../../assets/rng-soccer/live-icon.svg';
import historyBtnIcon from '../../../assets/rng-soccer/history-btn.svg';
import homeDefaultLogo from '../../../assets/rng-soccer/team-icon/home-default-logo.svg';
import awayDefaultLogo from '../../../assets/rng-soccer/team-icon/away-default-logo.svg';
import cardBack from '../../../assets/cards/card-back.svg';
import closeIcon from '../../../assets/rng-soccer/close.svg';
import bgGame from '../../../assets/rng-soccer/bg-game.webp';

const RngSoccerDemo: React.FC = () => {
    return (
        <div
            className="sport-item"
            style={{
                background: `url(${bgGame}) no-repeat center`,
                backgroundSize: 'cover'
            }}
        >
            <div className="wrapper-sport-top">
                <div className="game-name">
                    <div className="game-name-text">
                        RNG Soccer
                        <img src={liveIcon} alt="live" className="live-icon" />
                    </div>
                    <div className="game-name-round">#37699</div>
                </div>
                <div className="score-board-img">
                    <img src={historyBtnIcon} alt="bxh" />
                </div>
            </div>

            <div className="wrapper-sport-middle">
                <div className="sport-team home-team">
                    <div className="sport-team-img">
                        <img src={homeDefaultLogo} alt="home-team" />
                    </div>
                    <div className="sport-team-name">Man.city</div>
                </div>
                <div className="sport-result">
                    <div className="container-result">
                        <div className="card-section">
                            <img src={cardBack} alt="card" />
                        </div>
                        <div className="result-section">
                            <div className="result">
                                <span>0</span>
                            </div>
                            <div className="result">
                                <span>12</span>
                            </div>
                        </div>
                        <div className="card-section">
                            <img src={cardBack} alt="card" />
                        </div>
                    </div>
                    <div className="timer">
                        <div className="dots"></div>
                    </div>
                </div>
                <div className="sport-team away-team">
                    <div className="sport-team-img">
                        <img src={awayDefaultLogo} alt="away-team" />
                    </div>
                    <div className="sport-team-name">Arsenal</div>
                </div>
            </div>

            <div className="wrapper-sport-bottom">
                <div className="bet-option">
                    <div className="bet-option-item">
                        <span className="team">Home</span>
                        <span className="score">2.00</span>
                    </div>
                    <div className="bet-option-item">
                        <span className="team">Draw</span>
                        <span className="score">11.00</span>
                    </div>
                    <div className="bet-option-item active">
                        <span className="team">Away</span>
                        <span className="score">2.00</span>
                    </div>
                </div>
            </div>

            <div className="wrapper-popup">
                <div className="history-block">
                    <div className="history-block-item">
                        <span>Home</span>
                        <span>43%</span>
                    </div>
                    <div className="history-block-item">
                        <span>Draw</span>
                        <span>10%</span>
                    </div>
                    <div className="history-block-item">
                        <span>Away</span>
                        <span>43%</span>
                    </div>
                </div>
                <div className="close-popup">
                    <img src={closeIcon} alt="close" className="close-icon" />
                </div>
            </div>
        </div>
    );
};

export default RngSoccerDemo; 