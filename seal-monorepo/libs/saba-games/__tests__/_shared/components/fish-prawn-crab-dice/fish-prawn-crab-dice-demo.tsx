import React from 'react';
import FishPrawnCrabDice, { FishPrawnCrabSymbol } from '../../../../src/_shared/components/fish-prawn-crab-dice/index';
import { Size } from '../../../../src/_shared/constants';

const FishPrawnCrabDiceDemo: React.FC = () => {
    const allSymbols = [
        FishPrawnCrabSymbol.FISH,
        FishPrawnCrabSymbol.PRAWN,
        FishPrawnCrabSymbol.CRAB,
        FishPrawnCrabSymbol.GOURD,
        FishPrawnCrabSymbol.ROOSTER,
        FishPrawnCrabSymbol.STAG,
        FishPrawnCrabSymbol.EMPTY
    ];

    const allSizes = [Size.large, Size.medium, Size.small];

    return (
        <div style={{ padding: '20px' }}>
            <h2>Fish Prawn Crab Dice Demo</h2>

            {allSizes.map(size => (
                <div key={size} style={{ marginBottom: '20px' }}>
                    <h3>Size: {size}</h3>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {allSymbols.map(symbol => (
                            <div key={symbol} style={{ textAlign: 'center', margin: '10px' }}>
                                <FishPrawnCrabDice symbol={symbol} size={size} />
                                <div style={{ marginTop: '5px', fontSize: '12px' }}>
                                    {FishPrawnCrabSymbol[symbol]}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FishPrawnCrabDiceDemo; 