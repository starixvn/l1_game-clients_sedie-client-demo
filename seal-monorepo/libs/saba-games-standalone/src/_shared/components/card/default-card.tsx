import React from 'react';
import { DefaultCardProps } from './types';
import { convertRank, suffixNameMapping } from './utils/card-utils';
import Styles from "./card.module.scss";

const DefaultCard: React.FC<DefaultCardProps> = ({ result, srcPathCard }) => {
    const nameCard = `${convertRank(result.card)}-${suffixNameMapping[result.type]}.svg`;

    return (
        <img
            src={`${srcPathCard}${nameCard}#v1`}
            className={Styles["card-suite"]}
            height={55}
            width={40}
            alt="suite"
        />
    );
};

export default DefaultCard; 