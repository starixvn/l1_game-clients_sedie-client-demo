/**
 * Re-export the game classes to maintain backward compatibility
 */
import GameBase from './core/game-base.core';
import GatewayGameBase from './gateway/gateway-game-base';

export { GameBase, GatewayGameBase };
export default GatewayGameBase;
