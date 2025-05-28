import React from 'react';
import * as gc from '@sg/sg-game-client';

interface RoundTitleProps {
    roundId: number;
}

export const RoundTitle: React.FC<RoundTitleProps> = ({ roundId }) => {
    const t = (key) => gc.Translator.translate(key, { languageId: gc.Translator.getCurrentLanguageId() });
    return <div className="round-title">{t('Common.round')} {roundId}</div>;
}; 