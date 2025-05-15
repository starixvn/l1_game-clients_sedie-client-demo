import React, { useState } from 'react';
import AnimatedDice, { AnimatedDiceSet } from './animated-dice';
import { ColorGameSymbol, diceValueToSymbol } from './index';
import { Size } from '../../constants';
import styles from './dice-demo.module.scss';

const DiceDemo: React.FC = () => {
    const [isRolling, setIsRolling] = useState(false);
    const [finalSymbol, setFinalSymbol] = useState<ColorGameSymbol>(ColorGameSymbol.BLUE);
    const [finalSymbols, setFinalSymbols] = useState<ColorGameSymbol[]>([]);
    const [isManualMode, setIsManualMode] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [manualSymbols, setManualSymbols] = useState<ColorGameSymbol[]>([]);
    const [animationDuration, setAnimationDuration] = useState(3000);
    const [staggerDelay, setStaggerDelay] = useState(100);
    const [finalRollDelay, setFinalRollDelay] = useState(200);
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

    const getRandomSymbol = (): ColorGameSymbol => {
        const randomValue = Math.floor(Math.random() * 6) + 1;
        return diceValueToSymbol(randomValue);
    };

    const handleSingleDiceRoll = () => {
        if (isRolling) return;
        setIsRolling(true);
        setFinalSymbol(getRandomSymbol());
    };

    const handleMultipleDiceRoll = () => {
        if (isRolling) return;
        setIsRolling(true);
        setFinalSymbols([getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
    };

    const handleAnimationComplete = () => {
        setIsRolling(false);
    };

    const handleManualModeToggle = () => {
        setIsManualMode(!isManualMode);
        setCurrentStep(0);
        setManualSymbols([]);
    };

    const handleManualStep = () => {
        if (currentStep < 8) {
            const newSymbol = getRandomSymbol();
            setManualSymbols([...manualSymbols, newSymbol]);
            setCurrentStep(currentStep + 1);
        }
    };

    const handleManualReset = () => {
        setCurrentStep(0);
        setManualSymbols([]);
    };

    const handleAnimationDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAnimationDuration(Number(e.target.value));
    };

    const handleStaggerDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStaggerDelay(Number(e.target.value));
    };

    const handleFinalRollDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFinalRollDelay(Number(e.target.value));
    };

    const toggleRightPanel = () => {
        setIsRightPanelOpen(!isRightPanelOpen);
    };

    return (
        <div className={styles.demoContainer}>
            <div className={styles.mainContent}>
                <h1>3D Dice Animation Demo</h1>

                <section className={styles.demoSection}>
                    <h2>Single Dice - Different Sizes</h2>
                    <div className={styles.diceRow}>
                        <div className={styles.diceDemo}>
                            <h3>X-Large</h3>
                            <AnimatedDice
                                finalSymbol={finalSymbol}
                                size={Size.large}
                                onAnimationComplete={handleAnimationComplete}
                            />
                        </div>
                        {/* <div className={styles.diceDemo}>
                            <h3>Large</h3>
                            <AnimatedDice
                                finalSymbol={finalSymbol}
                                size={Size.large}
                                onAnimationComplete={handleAnimationComplete}
                                animationDuration={animationDuration}
                            />
                        </div>
                        <div className={styles.diceDemo}>
                            <h3>Medium</h3>
                            <AnimatedDice
                                finalSymbol={finalSymbol}
                                size={Size.medium}
                                onAnimationComplete={handleAnimationComplete}
                                animationDuration={animationDuration}
                            />
                        </div>
                        <div className={styles.diceDemo}>
                            <h3>Small</h3>
                            <AnimatedDice
                                finalSymbol={finalSymbol}
                                size={Size.small}
                                onAnimationComplete={handleAnimationComplete}
                                animationDuration={animationDuration}
                            />
                        </div> */}
                    </div>
                    <button
                        className={styles.rollButton}
                        onClick={handleSingleDiceRoll}
                        disabled={isRolling}
                    >
                        Roll Single Dice
                    </button>
                </section>

                <section className={styles.demoSection}>
                    <h2>Multiple Dice Set</h2>
                    <div className={styles.diceSetDemo}>
                        <AnimatedDiceSet
                            finalSymbols={finalSymbols}
                            size={Size.large}
                            onAllAnimationsComplete={handleAnimationComplete}
                            staggerDelay={staggerDelay}
                            finalRollSequenceDelay={finalRollDelay}
                        />
                    </div>
                    <button
                        className={styles.rollButton}
                        onClick={handleMultipleDiceRoll}
                        disabled={isRolling}
                    >
                        Roll Multiple Dice
                    </button>
                </section>

                <section className={styles.demoSection}>
                    <h2>Manual Play Mode</h2>
                    <div className={styles.manualControls}>
                        <button
                            className={`${styles.rollButton} ${styles.modeButton}`}
                            onClick={handleManualModeToggle}
                        >
                            {isManualMode ? 'Exit Manual Mode' : 'Enter Manual Mode'}
                        </button>

                        {isManualMode && (
                            <div className={styles.manualPlayArea}>
                                <div className={styles.manualDice}>
                                    <AnimatedDice
                                        finalSymbol={manualSymbols[manualSymbols.length - 1] || ColorGameSymbol.EMPTY}
                                        size={Size.large}
                                    />
                                </div>
                                <div className={styles.manualButtons}>
                                    <button
                                        className={styles.rollButton}
                                        onClick={handleManualStep}
                                        disabled={currentStep >= 8}
                                    >
                                        Next Step ({currentStep}/8)
                                    </button>
                                    <button
                                        className={`${styles.rollButton} ${styles.resetButton}`}
                                        onClick={handleManualReset}
                                    >
                                        Reset
                                    </button>
                                </div>
                                <div className={styles.manualHistory}>
                                    <h3>Roll History:</h3>
                                    <div className={styles.historyList}>
                                        {manualSymbols.map((symbol, index) => (
                                            <div key={index} className={styles.historyItem}>
                                                Step {index + 1}: {symbol}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <div className={`${styles.rightPanel} ${isRightPanelOpen ? styles.open : styles.closed}`}>
                <button
                    className={styles.panelToggle}
                    onClick={toggleRightPanel}
                >
                    {isRightPanelOpen ? '▶' : '◀'}
                </button>
                <div className={styles.panelContent}>
                    <h2>Animation Controls</h2>
                    <div className={styles.controls}>
                        <div className={styles.controlGroup}>
                            <label>Animation Duration (ms): {animationDuration}</label>
                            <input
                                type="range"
                                min="1000"
                                max="5000"
                                step="500"
                                value={animationDuration}
                                onChange={handleAnimationDurationChange}
                            />
                        </div>
                        <div className={styles.controlGroup}>
                            <label>Stagger Delay (ms): {staggerDelay}</label>
                            <input
                                type="range"
                                min="0"
                                max="500"
                                step="50"
                                value={staggerDelay}
                                onChange={handleStaggerDelayChange}
                            />
                        </div>
                        <div className={styles.controlGroup}>
                            <label>Final Roll Delay (ms): {finalRollDelay}</label>
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                step="100"
                                value={finalRollDelay}
                                onChange={handleFinalRollDelayChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiceDemo; 