import React from 'react';
import RNGSoccer from '../games/saba-club/rng-soccer';
import RNGSoccerBeforeStartGame from '../games/saba-club/rng-soccer-before-start-game';

const MainPage = () => {
    return (
        <div>
            <RNGSoccer namespace="RNGSoccer" language="en" />
            {/* <RNGSoccerBeforeStartGame /> */}
        </div>
    );
};

export default MainPage;
