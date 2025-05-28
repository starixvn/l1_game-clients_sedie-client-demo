import type { Result } from "../baccarat";
import * as gc from "@sg/sg-game-client";

export const TEXTS = {
    player: 'Player',
    banker: 'Banker',
} as const;

export interface BaccaratScenario extends Result {
    label: string;
    description: string;
    category: 'natural' | 'three_cards' | 'pairs';
    winner?: 'player' | 'banker' | 'tie';
    visible?: boolean;
}

export const BACCARAT_SCENARIOS: ReadonlyArray<BaccaratScenario> = [
    {
        label: 'Natural 9 vs 8',
        description: 'Player has Natural 8 (3♣+5♦=8) vs Banker Natural 9 (4♠+5♥=9). Both hands are Natural (2 cards).',
        category: 'natural',
        winner: 'banker',
        visible: true,
        banker: { card1: { card: 3, type: 0 }, card2: { card: 4, type: 1 } },
        player: { card1: { card: 2, type: 2 }, card2: { card: 4, type: 3 } },
    },
    {
        label: 'Natural 8 vs Natural 9',
        description: 'Player has Natural 9 (5♣+4♦=9) vs Banker Natural 8 (4♠+4♥=8). Both hands are Natural (2 cards).',
        category: 'natural',
        winner: 'player',
        visible: true,
        banker: { card1: { card: 3, type: 0 }, card2: { card: 3, type: 1 } },
        player: { card1: { card: 4, type: 2 }, card2: { card: 3, type: 3 } },
    },
    {
        label: 'Natural Tie (Both 8)',
        description: 'Player has Natural 8 (3♣+5♦=8) vs Banker Natural 8 (4♠+4♥=8). Both hands are Natural (2 cards).',
        category: 'natural',
        winner: 'tie',
        visible: true,
        banker: { card1: { card: 3, type: 0 }, card2: { card: 3, type: 1 } },
        player: { card1: { card: 2, type: 2 }, card2: { card: 4, type: 3 } },
    },
    {
        label: 'Perfect Pair - Banker',
        description: 'Player has (3♣+4♦=7) vs Banker Perfect Pair (4♠+4♠=8). Banker wins with Perfect Pair paying special odds.',
        category: 'pairs',
        winner: 'banker',
        visible: true,
        banker: { card1: { card: 3, type: 0 }, card2: { card: 3, type: 0 } },
        player: { card1: { card: 2, type: 2 }, card2: { card: 3, type: 3 } },
    },
    {
        label: 'Perfect Pair - Player',
        description: 'Player has Perfect Pair (4♣+4♣=8) vs Banker (3♠+4♥=7). Player wins with Perfect Pair paying special odds.',
        category: 'pairs',
        winner: 'player',
        visible: true,
        banker: { card1: { card: 2, type: 0 }, card2: { card: 3, type: 1 } },
        player: { card1: { card: 3, type: 2 }, card2: { card: 3, type: 2 } },
    },
    {
        label: 'Both Perfect Pairs',
        description: 'Player has Perfect Pair (3♣+3♣=6) vs Banker Perfect Pair (4♠+4♠=8). Both Perfect Pairs pay special odds.',
        category: 'pairs',
        winner: 'banker',
        visible: true,
        banker: { card1: { card: 3, type: 0 }, card2: { card: 3, type: 0 } },
        player: { card1: { card: 2, type: 2 }, card2: { card: 2, type: 2 } },
    },
    {
        label: 'Super 6',
        description: 'Player has (2♣+3♦=5) vs Banker (3♠+3♥=6). Banker wins with Super 6 paying special odds.',
        category: 'three_cards',
        winner: 'banker',
        visible: false,
        banker: { card1: { card: 2, type: 0 }, card2: { card: 2, type: 1 } },
        player: { card1: { card: 1, type: 2 }, card2: { card: 2, type: 3 } },
    },
    {
        label: 'Dragon Bonus - Natural Win',
        description: 'Player has (3♣+4♦=7) vs Banker Natural 9 (4♠+5♥=9). Natural win by 2 points qualifies for Dragon Bonus.',
        category: 'natural',
        winner: 'banker',
        visible: false,
        banker: { card1: { card: 3, type: 0 }, card2: { card: 4, type: 1 } },
        player: { card1: { card: 2, type: 2 }, card2: { card: 3, type: 3 } },
    },
    {
        label: 'Dragon Bonus - Non-Natural Win',
        description: 'Player has Natural 9 (9♦+J♠=9) vs Banker three cards (4♠+5♥+A♣=0). 9-point win pays Dragon Bonus.',
        category: 'three_cards',
        winner: 'player',
        visible: false,
        banker: { card1: { card: 3, type: 0 }, card2: { card: 4, type: 1 }, card3: { card: 0, type: 2 } },
        player: { card1: { card: 8, type: 3 }, card2: { card: 10, type: 0 } },
    },
    {
        label: 'Banker 3 Cards vs Player 2',
        description: 'Player has two cards (3♦+4♠=7) vs Banker three cards (2♠+3♥+3♣=8). Shows Banker drawing rules.',
        category: 'three_cards',
        winner: 'banker',
        visible: true,
        banker: { card1: { card: 1, type: 0 }, card2: { card: 2, type: 1 }, card3: { card: 2, type: 2 } },
        player: { card1: { card: 2, type: 3 }, card2: { card: 3, type: 0 } },
    },
    {
        label: 'Player 3 Cards vs Banker 2',
        description: 'Player draws third card (2♣+3♦+5♠=0) vs Banker two cards (3♠+4♥=7). Shows Player drawing first.',
        category: 'three_cards',
        winner: 'banker',
        visible: true,
        banker: { card1: { card: 2, type: 0 }, card2: { card: 3, type: 1 } },
        player: { card1: { card: 1, type: 2 }, card2: { card: 2, type: 3 }, card3: { card: 4, type: 0 } },
    },
    {
        label: 'Both 3 Cards - Player Wins',
        description: 'Player three cards (3♣+4♦+4♠=1) wins vs Banker three cards (2♠+3♥+3♣=8). Shows complete drawing rules.',
        category: 'three_cards',
        winner: 'player',
        visible: true,
        banker: { card1: { card: 1, type: 0 }, card2: { card: 2, type: 1 }, card3: { card: 2, type: 2 } },
        player: { card1: { card: 2, type: 2 }, card2: { card: 3, type: 3 }, card3: { card: 3, type: 0 } },
    },
    {
        label: 'Both 3 Cards - Banker Wins',
        description: 'Player three cards (2♣+3♦+2♥=7) vs Banker three cards (3♠+4♥+3♣=0). Shows complete drawing rules.',
        category: 'three_cards',
        winner: 'banker',
        visible: true,
        banker: { card1: { card: 2, type: 0 }, card2: { card: 3, type: 1 }, card3: { card: 2, type: 2 } },
        player: { card1: { card: 1, type: 2 }, card2: { card: 2, type: 3 }, card3: { card: 1, type: 1 } },
    },
    {
        label: 'Both 3 Cards - Tie',
        description: 'Player three cards (3♣+4♦+2♠=8) ties with Banker three cards (2♠+3♥+3♣=8). Rare three-card tie scenario.',
        category: 'three_cards',
        winner: 'tie',
        visible: true,
        banker: { card1: { card: 1, type: 0 }, card2: { card: 2, type: 1 }, card3: { card: 2, type: 2 } },
        player: { card1: { card: 2, type: 2 }, card2: { card: 3, type: 3 }, card3: { card: 1, type: 0 } },
    },
    {
        label: 'Multiple Pairs with 3 Cards',
        description: 'Player has pair (4♦+4♠+2♥=0) vs Banker three of a kind (3♠+3♥+3♣=9). Shows multiple pair combinations.',
        category: 'pairs',
        winner: 'banker',
        visible: true,
        banker: { card1: { card: 2, type: 0 }, card2: { card: 2, type: 1 }, card3: { card: 2, type: 2 } },
        player: { card1: { card: 3, type: 3 }, card2: { card: 3, type: 0 }, card3: { card: 1, type: 1 } },
    },
    {
        label: 'Dragon 7',
        description: 'Player has (3♦+4♠=6) vs Banker three cards (2♠+3♥+3♣=7). Banker Dragon 7 pays special odds.',
        category: 'three_cards',
        winner: 'banker',
        visible: false,
        banker: { card1: { card: 1, type: 0 }, card2: { card: 2, type: 1 }, card3: { card: 2, type: 2 } },
        player: { card1: { card: 2, type: 3 }, card2: { card: 3, type: 0 } },
    },
    {
        label: 'Panda 8',
        description: 'Player three cards (2♣+3♦+4♠=8) vs Banker (3♠+4♥=7). Player Panda 8 pays special odds.',
        category: 'three_cards',
        winner: 'player',
        visible: false,
        banker: { card1: { card: 2, type: 0 }, card2: { card: 3, type: 1 } },
        player: { card1: { card: 1, type: 2 }, card2: { card: 2, type: 3 }, card3: { card: 3, type: 0 } },
    },
    {
        label: 'Natural Tie 9',
        description: 'Player Natural 9 (5♣+4♦=9) ties with Banker Natural 9 (4♠+5♥=9). Highest possible Natural tie.',
        category: 'natural',
        winner: 'tie',
        visible: true,
        banker: { card1: { card: 3, type: 0 }, card2: { card: 4, type: 1 } },
        player: { card1: { card: 4, type: 2 }, card2: { card: 3, type: 3 } },
    }
] as const;

export const SCENARIOS = [
    // ... existing scenarios ...
] as const;

// Dragon tail demo data
export const DragonTailDemo: gc.RoundHistories.RoundHistory[] = [
    {
        roundId: 2128201,
        result: {
            player: {
                card1: { card: 8, type: 0 },
                card2: { card: 9, type: 1 }
            },
            banker: {
                card1: { card: 3, type: 2 },
                card2: { card: 4, type: 3 }
            }
        },
        settlementResult: {
            player: true,
            banker: false,
            tie: false,
            playerPair: false,
            bankerPair: false,
            natural: true,
            big: false,
            small: true
        }
    },
    {
        roundId: 2128202,
        result: {
            player: {
                card1: { card: 7, type: 1 },
                card2: { card: 8, type: 2 }
            },
            banker: {
                card1: { card: 2, type: 0 },
                card2: { card: 3, type: 1 }
            }
        },
        settlementResult: {
            player: true,
            banker: false,
            tie: false,
            playerPair: false,
            bankerPair: false,
            natural: true,
            big: false,
            small: true
        }
    },
    {
        roundId: 2128203,
        result: {
            player: {
                card1: { card: 6, type: 2 },
                card2: { card: 3, type: 3 },
                card3: { card: 8, type: 0 }
            },
            banker: {
                card1: { card: 4, type: 1 },
                card2: { card: 2, type: 2 }
            }
        },
        settlementResult: {
            player: true,
            banker: false,
            tie: false,
            playerPair: false,
            bankerPair: false,
            natural: false,
            big: true,
            small: false
        }
    },
    {
        roundId: 2128204,
        result: {
            player: {
                card1: { card: 5, type: 3 },
                card2: { card: 4, type: 0 },
                card3: { card: 9, type: 1 }
            },
            banker: {
                card1: { card: 3, type: 2 },
                card2: { card: 5, type: 3 }
            }
        },
        settlementResult: {
            player: true,
            banker: false,
            tie: false,
            playerPair: false,
            bankerPair: false,
            natural: false,
            big: true,
            small: false
        }
    },
    {
        roundId: 2128205,
        result: {
            player: {
                card1: { card: 7, type: 0 },
                card2: { card: 2, type: 1 },
                card3: { card: 8, type: 2 }
            },
            banker: {
                card1: { card: 4, type: 3 },
                card2: { card: 3, type: 0 }
            }
        },
        settlementResult: {
            player: true,
            banker: false,
            tie: false,
            playerPair: false,
            bankerPair: false,
            natural: false,
            big: true,
            small: false
        }
    },
    {
        roundId: 2128206,
        result: {
            player: {
                card1: { card: 6, type: 1 },
                card2: { card: 3, type: 2 },
                card3: { card: 9, type: 3 }
            },
            banker: {
                card1: { card: 2, type: 0 },
                card2: { card: 5, type: 1 }
            }
        },
        settlementResult: {
            player: true,
            banker: false,
            tie: false,
            playerPair: false,
            bankerPair: false,
            natural: false,
            big: true,
            small: false
        }
    },
    // Dragon tail starts here (3 more player wins)
    {
        roundId: 2128207,
        result: {
            player: {
                card1: { card: 8, type: 2 },
                card2: { card: 1, type: 3 },
                card3: { card: 8, type: 0 }
            },
            banker: {
                card1: { card: 3, type: 1 },
                card2: { card: 4, type: 2 }
            }
        },
        settlementResult: {
            player: true,
            banker: false,
            tie: false,
            playerPair: false,
            bankerPair: false,
            natural: false,
            big: true,
            small: false
        }
    },
    {
        roundId: 2128208,
        result: {
            player: {
                card1: { card: 7, type: 3 },
                card2: { card: 2, type: 0 },
                card3: { card: 9, type: 1 }
            },
            banker: {
                card1: { card: 4, type: 2 },
                card2: { card: 3, type: 3 }
            }
        },
        settlementResult: {
            player: true,
            banker: false,
            tie: false,
            playerPair: false,
            bankerPair: false,
            natural: false,
            big: true,
            small: false
        }
    },
    {
        roundId: 2128209,
        result: {
            player: {
                card1: { card: 6, type: 0 },
                card2: { card: 3, type: 1 },
                card3: { card: 8, type: 2 }
            },
            banker: {
                card1: { card: 2, type: 3 },
                card2: { card: 5, type: 0 }
            }
        },
        settlementResult: {
            player: true,
            banker: false,
            tie: false,
            playerPair: false,
            bankerPair: false,
            natural: false,
            big: true,
            small: false
        }
    },
    // Switch to banker wins
    {
        roundId: 2128210,
        result: {
            player: {
                card1: { card: 2, type: 1 },
                card2: { card: 3, type: 2 }
            },
            banker: {
                card1: { card: 8, type: 3 },
                card2: { card: 1, type: 0 }
            }
        },
        settlementResult: {
            player: false,
            banker: true,
            tie: false,
            playerPair: false,
            bankerPair: false,
            natural: true,
            big: false,
            small: true
        }
    }
];

// Use DragonTailDemo for RoundHistory
export const RoundHistory: gc.RoundHistories.RoundHistory[] = DragonTailDemo;

// Multiple Dragon Tails demo data
export const MultiDragonTailsDemo: gc.RoundHistories.RoundHistory[] = [
    // First column - 6 player wins
    ...Array(6).fill(null).map((_, i) => ({
        roundId: 2128301 + i,
        result: {
            player: {
                card1: { card: 8, type: 0 },
                card2: { card: 9, type: 1 }
            },
            banker: {
                card1: { card: 3, type: 2 },
                card2: { card: 4, type: 3 }
            }
        },
        settlementResult: {
            player: true,
            banker: false,
            tie: false,
            playerPair: false,
            bankerPair: false,
            natural: true,
            big: false,
            small: true
        }
    })),
    // First dragon tail - 3 more player wins
    ...Array(3).fill(null).map((_, i) => ({
        roundId: 2128307 + i,
        result: {
            player: {
                card1: { card: 7, type: 0 },
                card2: { card: 2, type: 1 },
                card3: { card: 8, type: 2 }
            },
            banker: {
                card1: { card: 4, type: 3 },
                card2: { card: 3, type: 0 }
            }
        },
        settlementResult: {
            player: true,
            banker: false,
            tie: false,
            playerPair: false,
            bankerPair: false,
            natural: false,
            big: true,
            small: false
        }
    })),
    // Second column - 6 player wins
    ...Array(6).fill(null).map((_, i) => ({
        roundId: 2128310 + i,
        result: {
            player: {
                card1: { card: 6, type: 1 },
                card2: { card: 3, type: 2 }
            },
            banker: {
                card1: { card: 2, type: 3 },
                card2: { card: 4, type: 0 }
            }
        },
        settlementResult: {
            player: true,
            banker: false,
            tie: false,
            playerPair: false,
            bankerPair: false,
            natural: true,
            big: false,
            small: true
        }
    })),
    // Second dragon tail - 4 more player wins
    ...Array(4).fill(null).map((_, i) => ({
        roundId: 2128316 + i,
        result: {
            player: {
                card1: { card: 5, type: 2 },
                card2: { card: 4, type: 3 },
                card3: { card: 9, type: 0 }
            },
            banker: {
                card1: { card: 3, type: 1 },
                card2: { card: 2, type: 2 }
            }
        },
        settlementResult: {
            player: true,
            banker: false,
            tie: false,
            playerPair: false,
            bankerPair: false,
            natural: false,
            big: true,
            small: false
        }
    })),
    // Switch to banker win
    {
        roundId: 2128320,
        result: {
            player: {
                card1: { card: 2, type: 0 },
                card2: { card: 3, type: 1 }
            },
            banker: {
                card1: { card: 8, type: 2 },
                card2: { card: 9, type: 3 }
            }
        },
        settlementResult: {
            player: false,
            banker: true,
            tie: false,
            playerPair: false,
            bankerPair: false,
            natural: true,
            big: false,
            small: true
        }
    },
    ...Array(7).fill(null).map((_, i) => ({
        roundId: 2128320 + i,
        result: {
            player: {
                card1: { card: 2, type: 0 },
                card2: { card: 3, type: 1 }
            },
            banker: {
                card1: { card: 8, type: 2 },
                card2: { card: 9, type: 3 }
            }
        },
        settlementResult: {
            player: false,
            banker: true,
            tie: false,
            playerPair: false,
            bankerPair: false,
            natural: true,
            big: false,
            small: true
        }
    })),
];

// Two Alternating Dragon Tails demo data
export const TwoAlternatingDragonTailsDemo: gc.RoundHistories.RoundHistory[] = [
    // First column - 6 banker wins
    ...Array(6).fill(null).map((_, i) => ({
        roundId: 2128401 + i,
        result: {
            player: {
                card1: { card: 2, type: 0 },
                card2: { card: 3, type: 1 }
            },
            banker: {
                card1: { card: 8, type: 2 },
                card2: { card: 9, type: 3 }
            }
        },
        settlementResult: {
            player: false,
            banker: true,
            tie: false,
            playerPair: false,
            bankerPair: false,
            natural: true,
            big: false,
            small: true
        }
    })),
    // First dragon tail - 3 more banker wins
    ...Array(3).fill(null).map((_, i) => ({
        roundId: 2128407 + i,
        result: {
            player: {
                card1: { card: 3, type: 0 },
                card2: { card: 2, type: 1 },
                card3: { card: 1, type: 2 }
            },
            banker: {
                card1: { card: 7, type: 3 },
                card2: { card: 8, type: 0 },
                card3: { card: 2, type: 1 }
            }
        },
        settlementResult: {
            player: false,
            banker: true,
            tie: false,
            playerPair: false,
            bankerPair: false,
            natural: false,
            big: true,
            small: false
        }
    })),
    // Switch to player wins - Second column starts
    ...Array(6).fill(null).map((_, i) => ({
        roundId: 2128410 + i,
        result: {
            player: {
                card1: { card: 8, type: 0 },
                card2: { card: 9, type: 1 }
            },
            banker: {
                card1: { card: 3, type: 2 },
                card2: { card: 4, type: 3 }
            }
        },
        settlementResult: {
            player: true,
            banker: false,
            tie: false,
            playerPair: false,
            bankerPair: false,
            natural: true,
            big: false,
            small: true
        }
    })),
    // Second dragon tail - 3 more player wins
    ...Array(3).fill(null).map((_, i) => ({
        roundId: 2128416 + i,
        result: {
            player: {
                card1: { card: 7, type: 0 },
                card2: { card: 2, type: 1 },
                card3: { card: 8, type: 2 }
            },
            banker: {
                card1: { card: 4, type: 3 },
                card2: { card: 3, type: 0 }
            }
        },
        settlementResult: {
            player: true,
            banker: false,
            tie: false,
            playerPair: false,
            bankerPair: false,
            natural: false,
            big: true,
            small: false
        }
    }))
];

// Combined SCOREBOARD_SCENARIOS with both scenarios
export const SCOREBOARD_SCENARIOS = [{
    id: 'two_alternating_dragon_tails',
    label: 'Two Alternating Dragon Tails',
    description: 'Shows two dragon tails - first banker tail (9 wins) followed by player tail (9 wins)',
    category: 'patterns',
    visible: true,
    rounds: TwoAlternatingDragonTailsDemo
}, {
    id: 'multiple_dragon_tails',
    label: 'Multiple Dragon Tails',
    description: 'Shows how consecutive dragon tails turn right at the bottom without overlapping',
    category: 'patterns',
    visible: true,
    rounds: MultiDragonTailsDemo
}] as const;





export const RoundHistoryTestData = [
    {
        "roundId": 2130187,
        "result": {
            "player": {
                "card1": {
                    "card": 8,
                    "type": 3
                },
                "card2": {
                    "card": 3,
                    "type": 2
                },
                "card3": {
                    "card": 7,
                    "type": 3
                }
            },
            "banker": {
                "card1": {
                    "card": 6,
                    "type": 3
                },
                "card2": {
                    "card": 4,
                    "type": 1
                },
                "card3": {
                    "card": 5,
                    "type": 1
                }
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130186,
        "result": {
            "player": {
                "card1": {
                    "card": 9,
                    "type": 3
                },
                "card2": {
                    "card": 12,
                    "type": 2
                },
                "card3": {
                    "card": 11,
                    "type": 0
                }
            },
            "banker": {
                "card1": {
                    "card": 12,
                    "type": 1
                },
                "card2": {
                    "card": 6,
                    "type": 2
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130185,
        "result": {
            "player": {
                "card1": {
                    "card": 10,
                    "type": 0
                },
                "card2": {
                    "card": 0,
                    "type": 0
                },
                "card3": {
                    "card": 3,
                    "type": 3
                }
            },
            "banker": {
                "card1": {
                    "card": 5,
                    "type": 0
                },
                "card2": {
                    "card": 9,
                    "type": 3
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130184,
        "result": {
            "player": {
                "card1": {
                    "card": 1,
                    "type": 3
                },
                "card2": {
                    "card": 9,
                    "type": 1
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 9,
                    "type": 2
                },
                "card2": {
                    "card": 7,
                    "type": 0
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130183,
        "result": {
            "player": {
                "card1": {
                    "card": 9,
                    "type": 3
                },
                "card2": {
                    "card": 3,
                    "type": 3
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 11,
                    "type": 1
                },
                "card2": {
                    "card": 8,
                    "type": 0
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130182,
        "result": {
            "player": {
                "card1": {
                    "card": 8,
                    "type": 1
                },
                "card2": {
                    "card": 9,
                    "type": 3
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 1,
                    "type": 1
                },
                "card2": {
                    "card": 2,
                    "type": 3
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130181,
        "result": {
            "player": {
                "card1": {
                    "card": 9,
                    "type": 3
                },
                "card2": {
                    "card": 0,
                    "type": 2
                },
                "card3": {
                    "card": 6,
                    "type": 3
                }
            },
            "banker": {
                "card1": {
                    "card": 2,
                    "type": 0
                },
                "card2": {
                    "card": 0,
                    "type": 0
                },
                "card3": {
                    "card": 7,
                    "type": 1
                }
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130180,
        "result": {
            "player": {
                "card1": {
                    "card": 12,
                    "type": 3
                },
                "card2": {
                    "card": 8,
                    "type": 3
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 7,
                    "type": 2
                },
                "card2": {
                    "card": 8,
                    "type": 2
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130179,
        "result": {
            "player": {
                "card1": {
                    "card": 3,
                    "type": 2
                },
                "card2": {
                    "card": 7,
                    "type": 2
                },
                "card3": {
                    "card": 11,
                    "type": 3
                }
            },
            "banker": {
                "card1": {
                    "card": 7,
                    "type": 0
                },
                "card2": {
                    "card": 3,
                    "type": 0
                },
                "card3": {
                    "card": 2,
                    "type": 0
                }
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130178,
        "result": {
            "player": {
                "card1": {
                    "card": 9,
                    "type": 3
                },
                "card2": {
                    "card": 7,
                    "type": 0
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 10,
                    "type": 2
                },
                "card2": {
                    "card": 4,
                    "type": 3
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130177,
        "result": {
            "player": {
                "card1": {
                    "card": 0,
                    "type": 1
                },
                "card2": {
                    "card": 7,
                    "type": 2
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 4,
                    "type": 0
                },
                "card2": {
                    "card": 1,
                    "type": 1
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130176,
        "result": {
            "player": {
                "card1": {
                    "card": 1,
                    "type": 0
                },
                "card2": {
                    "card": 3,
                    "type": 1
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 2,
                    "type": 3
                },
                "card2": {
                    "card": 10,
                    "type": 2
                },
                "card3": {
                    "card": 8,
                    "type": 1
                }
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130175,
        "result": {
            "player": {
                "card1": {
                    "card": 4,
                    "type": 1
                },
                "card2": {
                    "card": 6,
                    "type": 0
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 6,
                    "type": 1
                },
                "card2": {
                    "card": 1,
                    "type": 1
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130174,
        "result": {
            "player": {
                "card1": {
                    "card": 8,
                    "type": 0
                },
                "card2": {
                    "card": 3,
                    "type": 0
                },
                "card3": {
                    "card": 2,
                    "type": 2
                }
            },
            "banker": {
                "card1": {
                    "card": 11,
                    "type": 3
                },
                "card2": {
                    "card": 9,
                    "type": 2
                },
                "card3": {
                    "card": 1,
                    "type": 3
                }
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130173,
        "result": {
            "player": {
                "card1": {
                    "card": 8,
                    "type": 2
                },
                "card2": {
                    "card": 3,
                    "type": 1
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 7,
                    "type": 2
                },
                "card2": {
                    "card": 12,
                    "type": 1
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130172,
        "result": {
            "player": {
                "card1": {
                    "card": 10,
                    "type": 1
                },
                "card2": {
                    "card": 6,
                    "type": 2
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 3,
                    "type": 0
                },
                "card2": {
                    "card": 5,
                    "type": 1
                },
                "card3": {
                    "card": 2,
                    "type": 3
                }
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130171,
        "result": {
            "player": {
                "card1": {
                    "card": 12,
                    "type": 1
                },
                "card2": {
                    "card": 4,
                    "type": 3
                },
                "card3": {
                    "card": 2,
                    "type": 3
                }
            },
            "banker": {
                "card1": {
                    "card": 3,
                    "type": 3
                },
                "card2": {
                    "card": 5,
                    "type": 1
                },
                "card3": {
                    "card": 8,
                    "type": 1
                }
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130170,
        "result": {
            "player": {
                "card1": {
                    "card": 9,
                    "type": 0
                },
                "card2": {
                    "card": 0,
                    "type": 1
                },
                "card3": {
                    "card": 12,
                    "type": 0
                }
            },
            "banker": {
                "card1": {
                    "card": 1,
                    "type": 1
                },
                "card2": {
                    "card": 2,
                    "type": 3
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130169,
        "result": {
            "player": {
                "card1": {
                    "card": 6,
                    "type": 2
                },
                "card2": {
                    "card": 1,
                    "type": 3
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 6,
                    "type": 1
                },
                "card2": {
                    "card": 0,
                    "type": 0
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130168,
        "result": {
            "player": {
                "card1": {
                    "card": 7,
                    "type": 1
                },
                "card2": {
                    "card": 0,
                    "type": 0
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 0,
                    "type": 1
                },
                "card2": {
                    "card": 10,
                    "type": 0
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130167,
        "result": {
            "player": {
                "card1": {
                    "card": 3,
                    "type": 0
                },
                "card2": {
                    "card": 4,
                    "type": 3
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 11,
                    "type": 1
                },
                "card2": {
                    "card": 6,
                    "type": 3
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130166,
        "result": {
            "player": {
                "card1": {
                    "card": 2,
                    "type": 3
                },
                "card2": {
                    "card": 11,
                    "type": 2
                },
                "card3": {
                    "card": 0,
                    "type": 1
                }
            },
            "banker": {
                "card1": {
                    "card": 2,
                    "type": 1
                },
                "card2": {
                    "card": 6,
                    "type": 1
                },
                "card3": {
                    "card": 0,
                    "type": 0
                }
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130165,
        "result": {
            "player": {
                "card1": {
                    "card": 9,
                    "type": 2
                },
                "card2": {
                    "card": 0,
                    "type": 3
                },
                "card3": {
                    "card": 7,
                    "type": 3
                }
            },
            "banker": {
                "card1": {
                    "card": 2,
                    "type": 0
                },
                "card2": {
                    "card": 0,
                    "type": 2
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130164,
        "result": {
            "player": {
                "card1": {
                    "card": 10,
                    "type": 3
                },
                "card2": {
                    "card": 9,
                    "type": 2
                },
                "card3": {
                    "card": 3,
                    "type": 3
                }
            },
            "banker": {
                "card1": {
                    "card": 1,
                    "type": 1
                },
                "card2": {
                    "card": 0,
                    "type": 3
                },
                "card3": {
                    "card": 11,
                    "type": 2
                }
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130163,
        "result": {
            "player": {
                "card1": {
                    "card": 9,
                    "type": 3
                },
                "card2": {
                    "card": 8,
                    "type": 3
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 12,
                    "type": 1
                },
                "card2": {
                    "card": 11,
                    "type": 0
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130162,
        "result": {
            "player": {
                "card1": {
                    "card": 11,
                    "type": 3
                },
                "card2": {
                    "card": 1,
                    "type": 1
                },
                "card3": {
                    "card": 4,
                    "type": 2
                }
            },
            "banker": {
                "card1": {
                    "card": 4,
                    "type": 3
                },
                "card2": {
                    "card": 11,
                    "type": 1
                },
                "card3": {
                    "card": 1,
                    "type": 3
                }
            }
        },
        "settlementResult": {
            "player": false,
            "banker": false,
            "big": true,
            "small": false,
            "tie": true,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130161,
        "result": {
            "player": {
                "card1": {
                    "card": 11,
                    "type": 3
                },
                "card2": {
                    "card": 4,
                    "type": 1
                },
                "card3": {
                    "card": 3,
                    "type": 3
                }
            },
            "banker": {
                "card1": {
                    "card": 9,
                    "type": 0
                },
                "card2": {
                    "card": 11,
                    "type": 2
                },
                "card3": {
                    "card": 12,
                    "type": 1
                }
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130160,
        "result": {
            "player": {
                "card1": {
                    "card": 12,
                    "type": 3
                },
                "card2": {
                    "card": 8,
                    "type": 0
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 5,
                    "type": 1
                },
                "card2": {
                    "card": 9,
                    "type": 3
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130159,
        "result": {
            "player": {
                "card1": {
                    "card": 7,
                    "type": 2
                },
                "card2": {
                    "card": 0,
                    "type": 1
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 0,
                    "type": 2
                },
                "card2": {
                    "card": 2,
                    "type": 0
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130158,
        "result": {
            "player": {
                "card1": {
                    "card": 11,
                    "type": 0
                },
                "card2": {
                    "card": 1,
                    "type": 1
                },
                "card3": {
                    "card": 3,
                    "type": 3
                }
            },
            "banker": {
                "card1": {
                    "card": 0,
                    "type": 0
                },
                "card2": {
                    "card": 12,
                    "type": 0
                },
                "card3": {
                    "card": 9,
                    "type": 2
                }
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130157,
        "result": {
            "player": {
                "card1": {
                    "card": 4,
                    "type": 0
                },
                "card2": {
                    "card": 6,
                    "type": 2
                },
                "card3": {
                    "card": 5,
                    "type": 0
                }
            },
            "banker": {
                "card1": {
                    "card": 3,
                    "type": 0
                },
                "card2": {
                    "card": 7,
                    "type": 0
                },
                "card3": {
                    "card": 11,
                    "type": 3
                }
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130156,
        "result": {
            "player": {
                "card1": {
                    "card": 4,
                    "type": 2
                },
                "card2": {
                    "card": 6,
                    "type": 3
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 12,
                    "type": 3
                },
                "card2": {
                    "card": 7,
                    "type": 1
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130155,
        "result": {
            "player": {
                "card1": {
                    "card": 7,
                    "type": 2
                },
                "card2": {
                    "card": 10,
                    "type": 3
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 4,
                    "type": 1
                },
                "card2": {
                    "card": 12,
                    "type": 1
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130154,
        "result": {
            "player": {
                "card1": {
                    "card": 10,
                    "type": 0
                },
                "card2": {
                    "card": 0,
                    "type": 0
                },
                "card3": {
                    "card": 8,
                    "type": 1
                }
            },
            "banker": {
                "card1": {
                    "card": 12,
                    "type": 2
                },
                "card2": {
                    "card": 2,
                    "type": 1
                },
                "card3": {
                    "card": 2,
                    "type": 0
                }
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130153,
        "result": {
            "player": {
                "card1": {
                    "card": 12,
                    "type": 2
                },
                "card2": {
                    "card": 8,
                    "type": 2
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 4,
                    "type": 3
                },
                "card2": {
                    "card": 6,
                    "type": 3
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130152,
        "result": {
            "player": {
                "card1": {
                    "card": 0,
                    "type": 1
                },
                "card2": {
                    "card": 5,
                    "type": 0
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 9,
                    "type": 1
                },
                "card2": {
                    "card": 4,
                    "type": 0
                },
                "card3": {
                    "card": 0,
                    "type": 2
                }
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130151,
        "result": {
            "player": {
                "card1": {
                    "card": 5,
                    "type": 0
                },
                "card2": {
                    "card": 6,
                    "type": 0
                },
                "card3": {
                    "card": 1,
                    "type": 2
                }
            },
            "banker": {
                "card1": {
                    "card": 4,
                    "type": 3
                },
                "card2": {
                    "card": 12,
                    "type": 3
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": false,
            "big": true,
            "small": false,
            "tie": true,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130150,
        "result": {
            "player": {
                "card1": {
                    "card": 0,
                    "type": 0
                },
                "card2": {
                    "card": 1,
                    "type": 1
                },
                "card3": {
                    "card": 7,
                    "type": 0
                }
            },
            "banker": {
                "card1": {
                    "card": 10,
                    "type": 1
                },
                "card2": {
                    "card": 5,
                    "type": 2
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130149,
        "result": {
            "player": {
                "card1": {
                    "card": 6,
                    "type": 2
                },
                "card2": {
                    "card": 9,
                    "type": 3
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 2,
                    "type": 1
                },
                "card2": {
                    "card": 1,
                    "type": 2
                },
                "card3": {
                    "card": 2,
                    "type": 2
                }
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130148,
        "result": {
            "player": {
                "card1": {
                    "card": 6,
                    "type": 0
                },
                "card2": {
                    "card": 2,
                    "type": 0
                },
                "card3": {
                    "card": 7,
                    "type": 3
                }
            },
            "banker": {
                "card1": {
                    "card": 8,
                    "type": 0
                },
                "card2": {
                    "card": 0,
                    "type": 3
                },
                "card3": {
                    "card": 2,
                    "type": 3
                }
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130147,
        "result": {
            "player": {
                "card1": {
                    "card": 11,
                    "type": 0
                },
                "card2": {
                    "card": 12,
                    "type": 2
                },
                "card3": {
                    "card": 8,
                    "type": 1
                }
            },
            "banker": {
                "card1": {
                    "card": 12,
                    "type": 3
                },
                "card2": {
                    "card": 3,
                    "type": 0
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130146,
        "result": {
            "player": {
                "card1": {
                    "card": 5,
                    "type": 1
                },
                "card2": {
                    "card": 2,
                    "type": 1
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 12,
                    "type": 0
                },
                "card2": {
                    "card": 0,
                    "type": 1
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130145,
        "result": {
            "player": {
                "card1": {
                    "card": 5,
                    "type": 2
                },
                "card2": {
                    "card": 6,
                    "type": 0
                },
                "card3": {
                    "card": 11,
                    "type": 3
                }
            },
            "banker": {
                "card1": {
                    "card": 6,
                    "type": 1
                },
                "card2": {
                    "card": 3,
                    "type": 3
                },
                "card3": {
                    "card": 8,
                    "type": 2
                }
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130144,
        "result": {
            "player": {
                "card1": {
                    "card": 5,
                    "type": 1
                },
                "card2": {
                    "card": 4,
                    "type": 3
                },
                "card3": {
                    "card": 3,
                    "type": 0
                }
            },
            "banker": {
                "card1": {
                    "card": 0,
                    "type": 1
                },
                "card2": {
                    "card": 2,
                    "type": 0
                },
                "card3": {
                    "card": 5,
                    "type": 0
                }
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130143,
        "result": {
            "player": {
                "card1": {
                    "card": 8,
                    "type": 1
                },
                "card2": {
                    "card": 11,
                    "type": 1
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 4,
                    "type": 0
                },
                "card2": {
                    "card": 1,
                    "type": 1
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130142,
        "result": {
            "player": {
                "card1": {
                    "card": 0,
                    "type": 0
                },
                "card2": {
                    "card": 11,
                    "type": 3
                },
                "card3": {
                    "card": 4,
                    "type": 1
                }
            },
            "banker": {
                "card1": {
                    "card": 7,
                    "type": 1
                },
                "card2": {
                    "card": 7,
                    "type": 0
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": false,
            "big": true,
            "small": false,
            "tie": true,
            "playerPair": false,
            "bankerPair": true,
            "natural": false
        }
    },
    {
        "roundId": 2130141,
        "result": {
            "player": {
                "card1": {
                    "card": 4,
                    "type": 3
                },
                "card2": {
                    "card": 1,
                    "type": 0
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 6,
                    "type": 2
                },
                "card2": {
                    "card": 3,
                    "type": 2
                },
                "card3": {
                    "card": 4,
                    "type": 1
                }
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130140,
        "result": {
            "player": {
                "card1": {
                    "card": 0,
                    "type": 1
                },
                "card2": {
                    "card": 9,
                    "type": 2
                },
                "card3": {
                    "card": 12,
                    "type": 0
                }
            },
            "banker": {
                "card1": {
                    "card": 7,
                    "type": 3
                },
                "card2": {
                    "card": 1,
                    "type": 3
                },
                "card3": {
                    "card": 9,
                    "type": 3
                }
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130139,
        "result": {
            "player": {
                "card1": {
                    "card": 8,
                    "type": 2
                },
                "card2": {
                    "card": 10,
                    "type": 3
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 9,
                    "type": 1
                },
                "card2": {
                    "card": 7,
                    "type": 3
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130138,
        "result": {
            "player": {
                "card1": {
                    "card": 7,
                    "type": 1
                },
                "card2": {
                    "card": 12,
                    "type": 3
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 2,
                    "type": 1
                },
                "card2": {
                    "card": 8,
                    "type": 3
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130137,
        "result": {
            "player": {
                "card1": {
                    "card": 2,
                    "type": 0
                },
                "card2": {
                    "card": 11,
                    "type": 2
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 10,
                    "type": 2
                },
                "card2": {
                    "card": 8,
                    "type": 0
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130136,
        "result": {
            "player": {
                "card1": {
                    "card": 5,
                    "type": 2
                },
                "card2": {
                    "card": 1,
                    "type": 0
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 10,
                    "type": 2
                },
                "card2": {
                    "card": 8,
                    "type": 1
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130135,
        "result": {
            "player": {
                "card1": {
                    "card": 10,
                    "type": 1
                },
                "card2": {
                    "card": 7,
                    "type": 2
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 2,
                    "type": 0
                },
                "card2": {
                    "card": 8,
                    "type": 0
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130134,
        "result": {
            "player": {
                "card1": {
                    "card": 9,
                    "type": 2
                },
                "card2": {
                    "card": 10,
                    "type": 3
                },
                "card3": {
                    "card": 8,
                    "type": 0
                }
            },
            "banker": {
                "card1": {
                    "card": 9,
                    "type": 1
                },
                "card2": {
                    "card": 12,
                    "type": 1
                },
                "card3": {
                    "card": 5,
                    "type": 0
                }
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130133,
        "result": {
            "player": {
                "card1": {
                    "card": 12,
                    "type": 2
                },
                "card2": {
                    "card": 9,
                    "type": 3
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 8,
                    "type": 0
                },
                "card2": {
                    "card": 8,
                    "type": 1
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": true,
            "natural": true
        }
    },
    {
        "roundId": 2130132,
        "result": {
            "player": {
                "card1": {
                    "card": 5,
                    "type": 1
                },
                "card2": {
                    "card": 3,
                    "type": 3
                },
                "card3": {
                    "card": 12,
                    "type": 2
                }
            },
            "banker": {
                "card1": {
                    "card": 4,
                    "type": 2
                },
                "card2": {
                    "card": 10,
                    "type": 0
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130131,
        "result": {
            "player": {
                "card1": {
                    "card": 7,
                    "type": 1
                },
                "card2": {
                    "card": 4,
                    "type": 1
                },
                "card3": {
                    "card": 12,
                    "type": 3
                }
            },
            "banker": {
                "card1": {
                    "card": 10,
                    "type": 3
                },
                "card2": {
                    "card": 11,
                    "type": 1
                },
                "card3": {
                    "card": 3,
                    "type": 0
                }
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130130,
        "result": {
            "player": {
                "card1": {
                    "card": 10,
                    "type": 3
                },
                "card2": {
                    "card": 4,
                    "type": 1
                },
                "card3": {
                    "card": 9,
                    "type": 2
                }
            },
            "banker": {
                "card1": {
                    "card": 0,
                    "type": 2
                },
                "card2": {
                    "card": 10,
                    "type": 1
                },
                "card3": {
                    "card": 4,
                    "type": 2
                }
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130129,
        "result": {
            "player": {
                "card1": {
                    "card": 12,
                    "type": 1
                },
                "card2": {
                    "card": 12,
                    "type": 3
                },
                "card3": {
                    "card": 2,
                    "type": 1
                }
            },
            "banker": {
                "card1": {
                    "card": 12,
                    "type": 2
                },
                "card2": {
                    "card": 9,
                    "type": 1
                },
                "card3": {
                    "card": 0,
                    "type": 2
                }
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": true,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130128,
        "result": {
            "player": {
                "card1": {
                    "card": 4,
                    "type": 0
                },
                "card2": {
                    "card": 11,
                    "type": 1
                },
                "card3": {
                    "card": 4,
                    "type": 2
                }
            },
            "banker": {
                "card1": {
                    "card": 9,
                    "type": 1
                },
                "card2": {
                    "card": 10,
                    "type": 3
                },
                "card3": {
                    "card": 8,
                    "type": 0
                }
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130127,
        "result": {
            "player": {
                "card1": {
                    "card": 2,
                    "type": 3
                },
                "card2": {
                    "card": 4,
                    "type": 2
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 5,
                    "type": 0
                },
                "card2": {
                    "card": 8,
                    "type": 0
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130126,
        "result": {
            "player": {
                "card1": {
                    "card": 4,
                    "type": 0
                },
                "card2": {
                    "card": 3,
                    "type": 2
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 8,
                    "type": 2
                },
                "card2": {
                    "card": 4,
                    "type": 2
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130125,
        "result": {
            "player": {
                "card1": {
                    "card": 11,
                    "type": 2
                },
                "card2": {
                    "card": 7,
                    "type": 2
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 9,
                    "type": 3
                },
                "card2": {
                    "card": 12,
                    "type": 0
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130124,
        "result": {
            "player": {
                "card1": {
                    "card": 0,
                    "type": 3
                },
                "card2": {
                    "card": 8,
                    "type": 2
                },
                "card3": {
                    "card": 11,
                    "type": 1
                }
            },
            "banker": {
                "card1": {
                    "card": 9,
                    "type": 0
                },
                "card2": {
                    "card": 0,
                    "type": 0
                },
                "card3": {
                    "card": 8,
                    "type": 0
                }
            }
        },
        "settlementResult": {
            "player": false,
            "banker": false,
            "big": true,
            "small": false,
            "tie": true,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130123,
        "result": {
            "player": {
                "card1": {
                    "card": 9,
                    "type": 0
                },
                "card2": {
                    "card": 6,
                    "type": 1
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 7,
                    "type": 0
                },
                "card2": {
                    "card": 10,
                    "type": 0
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130122,
        "result": {
            "player": {
                "card1": {
                    "card": 2,
                    "type": 2
                },
                "card2": {
                    "card": 8,
                    "type": 2
                },
                "card3": {
                    "card": 3,
                    "type": 2
                }
            },
            "banker": {
                "card1": {
                    "card": 1,
                    "type": 1
                },
                "card2": {
                    "card": 4,
                    "type": 1
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130121,
        "result": {
            "player": {
                "card1": {
                    "card": 4,
                    "type": 0
                },
                "card2": {
                    "card": 11,
                    "type": 0
                },
                "card3": {
                    "card": 4,
                    "type": 3
                }
            },
            "banker": {
                "card1": {
                    "card": 2,
                    "type": 3
                },
                "card2": {
                    "card": 1,
                    "type": 2
                },
                "card3": {
                    "card": 1,
                    "type": 3
                }
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130120,
        "result": {
            "player": {
                "card1": {
                    "card": 7,
                    "type": 1
                },
                "card2": {
                    "card": 10,
                    "type": 0
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 5,
                    "type": 0
                },
                "card2": {
                    "card": 12,
                    "type": 0
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130119,
        "result": {
            "player": {
                "card1": {
                    "card": 5,
                    "type": 2
                },
                "card2": {
                    "card": 4,
                    "type": 1
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 0,
                    "type": 3
                },
                "card2": {
                    "card": 7,
                    "type": 3
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130118,
        "result": {
            "player": {
                "card1": {
                    "card": 4,
                    "type": 1
                },
                "card2": {
                    "card": 5,
                    "type": 1
                },
                "card3": {
                    "card": 11,
                    "type": 3
                }
            },
            "banker": {
                "card1": {
                    "card": 10,
                    "type": 3
                },
                "card2": {
                    "card": 2,
                    "type": 1
                },
                "card3": {
                    "card": 6,
                    "type": 2
                }
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130117,
        "result": {
            "player": {
                "card1": {
                    "card": 11,
                    "type": 1
                },
                "card2": {
                    "card": 0,
                    "type": 3
                },
                "card3": {
                    "card": 6,
                    "type": 3
                }
            },
            "banker": {
                "card1": {
                    "card": 3,
                    "type": 3
                },
                "card2": {
                    "card": 0,
                    "type": 1
                },
                "card3": {
                    "card": 7,
                    "type": 2
                }
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130116,
        "result": {
            "player": {
                "card1": {
                    "card": 5,
                    "type": 2
                },
                "card2": {
                    "card": 12,
                    "type": 3
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 12,
                    "type": 1
                },
                "card2": {
                    "card": 5,
                    "type": 1
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": false,
            "big": false,
            "small": true,
            "tie": true,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130115,
        "result": {
            "player": {
                "card1": {
                    "card": 1,
                    "type": 1
                },
                "card2": {
                    "card": 10,
                    "type": 3
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 1,
                    "type": 2
                },
                "card2": {
                    "card": 6,
                    "type": 3
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130114,
        "result": {
            "player": {
                "card1": {
                    "card": 3,
                    "type": 1
                },
                "card2": {
                    "card": 0,
                    "type": 1
                },
                "card3": {
                    "card": 2,
                    "type": 0
                }
            },
            "banker": {
                "card1": {
                    "card": 1,
                    "type": 2
                },
                "card2": {
                    "card": 7,
                    "type": 0
                },
                "card3": {
                    "card": 7,
                    "type": 2
                }
            }
        },
        "settlementResult": {
            "player": false,
            "banker": false,
            "big": true,
            "small": false,
            "tie": true,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130113,
        "result": {
            "player": {
                "card1": {
                    "card": 1,
                    "type": 0
                },
                "card2": {
                    "card": 5,
                    "type": 3
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 7,
                    "type": 1
                },
                "card2": {
                    "card": 0,
                    "type": 0
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130112,
        "result": {
            "player": {
                "card1": {
                    "card": 1,
                    "type": 0
                },
                "card2": {
                    "card": 12,
                    "type": 1
                },
                "card3": {
                    "card": 7,
                    "type": 2
                }
            },
            "banker": {
                "card1": {
                    "card": 5,
                    "type": 1
                },
                "card2": {
                    "card": 6,
                    "type": 2
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130111,
        "result": {
            "player": {
                "card1": {
                    "card": 11,
                    "type": 3
                },
                "card2": {
                    "card": 2,
                    "type": 0
                },
                "card3": {
                    "card": 5,
                    "type": 3
                }
            },
            "banker": {
                "card1": {
                    "card": 10,
                    "type": 2
                },
                "card2": {
                    "card": 0,
                    "type": 0
                },
                "card3": {
                    "card": 2,
                    "type": 3
                }
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130110,
        "result": {
            "player": {
                "card1": {
                    "card": 6,
                    "type": 0
                },
                "card2": {
                    "card": 11,
                    "type": 1
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 3,
                    "type": 3
                },
                "card2": {
                    "card": 9,
                    "type": 1
                },
                "card3": {
                    "card": 7,
                    "type": 1
                }
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130109,
        "result": {
            "player": {
                "card1": {
                    "card": 1,
                    "type": 0
                },
                "card2": {
                    "card": 7,
                    "type": 3
                },
                "card3": {
                    "card": 9,
                    "type": 1
                }
            },
            "banker": {
                "card1": {
                    "card": 10,
                    "type": 3
                },
                "card2": {
                    "card": 9,
                    "type": 3
                },
                "card3": {
                    "card": 7,
                    "type": 2
                }
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130108,
        "result": {
            "player": {
                "card1": {
                    "card": 1,
                    "type": 3
                },
                "card2": {
                    "card": 0,
                    "type": 3
                },
                "card3": {
                    "card": 3,
                    "type": 0
                }
            },
            "banker": {
                "card1": {
                    "card": 3,
                    "type": 2
                },
                "card2": {
                    "card": 6,
                    "type": 2
                },
                "card3": {
                    "card": 8,
                    "type": 2
                }
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130107,
        "result": {
            "player": {
                "card1": {
                    "card": 0,
                    "type": 0
                },
                "card2": {
                    "card": 5,
                    "type": 1
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 9,
                    "type": 1
                },
                "card2": {
                    "card": 5,
                    "type": 3
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130106,
        "result": {
            "player": {
                "card1": {
                    "card": 2,
                    "type": 0
                },
                "card2": {
                    "card": 9,
                    "type": 2
                },
                "card3": {
                    "card": 3,
                    "type": 2
                }
            },
            "banker": {
                "card1": {
                    "card": 9,
                    "type": 0
                },
                "card2": {
                    "card": 10,
                    "type": 3
                },
                "card3": {
                    "card": 7,
                    "type": 2
                }
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130105,
        "result": {
            "player": {
                "card1": {
                    "card": 6,
                    "type": 1
                },
                "card2": {
                    "card": 5,
                    "type": 0
                },
                "card3": {
                    "card": 3,
                    "type": 0
                }
            },
            "banker": {
                "card1": {
                    "card": 6,
                    "type": 3
                },
                "card2": {
                    "card": 8,
                    "type": 3
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130104,
        "result": {
            "player": {
                "card1": {
                    "card": 11,
                    "type": 1
                },
                "card2": {
                    "card": 3,
                    "type": 2
                },
                "card3": {
                    "card": 7,
                    "type": 3
                }
            },
            "banker": {
                "card1": {
                    "card": 5,
                    "type": 2
                },
                "card2": {
                    "card": 10,
                    "type": 0
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130103,
        "result": {
            "player": {
                "card1": {
                    "card": 3,
                    "type": 0
                },
                "card2": {
                    "card": 12,
                    "type": 0
                },
                "card3": {
                    "card": 1,
                    "type": 0
                }
            },
            "banker": {
                "card1": {
                    "card": 11,
                    "type": 3
                },
                "card2": {
                    "card": 1,
                    "type": 3
                },
                "card3": {
                    "card": 10,
                    "type": 0
                }
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130102,
        "result": {
            "player": {
                "card1": {
                    "card": 8,
                    "type": 2
                },
                "card2": {
                    "card": 5,
                    "type": 1
                },
                "card3": {
                    "card": 1,
                    "type": 1
                }
            },
            "banker": {
                "card1": {
                    "card": 12,
                    "type": 1
                },
                "card2": {
                    "card": 11,
                    "type": 3
                },
                "card3": {
                    "card": 5,
                    "type": 3
                }
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130101,
        "result": {
            "player": {
                "card1": {
                    "card": 6,
                    "type": 0
                },
                "card2": {
                    "card": 2,
                    "type": 0
                },
                "card3": {
                    "card": 3,
                    "type": 1
                }
            },
            "banker": {
                "card1": {
                    "card": 8,
                    "type": 0
                },
                "card2": {
                    "card": 6,
                    "type": 1
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130100,
        "result": {
            "player": {
                "card1": {
                    "card": 10,
                    "type": 2
                },
                "card2": {
                    "card": 8,
                    "type": 2
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 3,
                    "type": 1
                },
                "card2": {
                    "card": 7,
                    "type": 3
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130099,
        "result": {
            "player": {
                "card1": {
                    "card": 0,
                    "type": 2
                },
                "card2": {
                    "card": 4,
                    "type": 3
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 10,
                    "type": 3
                },
                "card2": {
                    "card": 2,
                    "type": 1
                },
                "card3": {
                    "card": 9,
                    "type": 2
                }
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130098,
        "result": {
            "player": {
                "card1": {
                    "card": 0,
                    "type": 3
                },
                "card2": {
                    "card": 2,
                    "type": 3
                },
                "card3": {
                    "card": 9,
                    "type": 3
                }
            },
            "banker": {
                "card1": {
                    "card": 0,
                    "type": 0
                },
                "card2": {
                    "card": 4,
                    "type": 2
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130097,
        "result": {
            "player": {
                "card1": {
                    "card": 4,
                    "type": 0
                },
                "card2": {
                    "card": 5,
                    "type": 3
                },
                "card3": {
                    "card": 2,
                    "type": 1
                }
            },
            "banker": {
                "card1": {
                    "card": 6,
                    "type": 2
                },
                "card2": {
                    "card": 12,
                    "type": 1
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130096,
        "result": {
            "player": {
                "card1": {
                    "card": 10,
                    "type": 3
                },
                "card2": {
                    "card": 3,
                    "type": 0
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 5,
                    "type": 2
                },
                "card2": {
                    "card": 2,
                    "type": 3
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130095,
        "result": {
            "player": {
                "card1": {
                    "card": 8,
                    "type": 1
                },
                "card2": {
                    "card": 12,
                    "type": 3
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 5,
                    "type": 0
                },
                "card2": {
                    "card": 8,
                    "type": 3
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130094,
        "result": {
            "player": {
                "card1": {
                    "card": 11,
                    "type": 3
                },
                "card2": {
                    "card": 6,
                    "type": 1
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 6,
                    "type": 3
                },
                "card2": {
                    "card": 4,
                    "type": 3
                },
                "card3": {
                    "card": 7,
                    "type": 0
                }
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130093,
        "result": {
            "player": {
                "card1": {
                    "card": 4,
                    "type": 1
                },
                "card2": {
                    "card": 3,
                    "type": 0
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 6,
                    "type": 0
                },
                "card2": {
                    "card": 10,
                    "type": 1
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130092,
        "result": {
            "player": {
                "card1": {
                    "card": 4,
                    "type": 2
                },
                "card2": {
                    "card": 2,
                    "type": 0
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 6,
                    "type": 0
                },
                "card2": {
                    "card": 9,
                    "type": 3
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": true,
            "banker": false,
            "big": false,
            "small": true,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": true
        }
    },
    {
        "roundId": 2130091,
        "result": {
            "player": {
                "card1": {
                    "card": 0,
                    "type": 1
                },
                "card2": {
                    "card": 5,
                    "type": 3
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 9,
                    "type": 0
                },
                "card2": {
                    "card": 1,
                    "type": 2
                },
                "card3": {
                    "card": 6,
                    "type": 3
                }
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130090,
        "result": {
            "player": {
                "card1": {
                    "card": 11,
                    "type": 0
                },
                "card2": {
                    "card": 6,
                    "type": 2
                },
                "card3": null
            },
            "banker": {
                "card1": {
                    "card": 7,
                    "type": 2
                },
                "card2": {
                    "card": 2,
                    "type": 2
                },
                "card3": {
                    "card": 6,
                    "type": 1
                }
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130089,
        "result": {
            "player": {
                "card1": {
                    "card": 12,
                    "type": 0
                },
                "card2": {
                    "card": 2,
                    "type": 3
                },
                "card3": {
                    "card": 0,
                    "type": 1
                }
            },
            "banker": {
                "card1": {
                    "card": 10,
                    "type": 2
                },
                "card2": {
                    "card": 0,
                    "type": 2
                },
                "card3": {
                    "card": 5,
                    "type": 3
                }
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130088,
        "result": {
            "player": {
                "card1": {
                    "card": 0,
                    "type": 0
                },
                "card2": {
                    "card": 2,
                    "type": 2
                },
                "card3": {
                    "card": 6,
                    "type": 2
                }
            },
            "banker": {
                "card1": {
                    "card": 6,
                    "type": 3
                },
                "card2": {
                    "card": 9,
                    "type": 0
                },
                "card3": null
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130087,
        "result": {
            "player": {
                "card1": {
                    "card": 5,
                    "type": 1
                },
                "card2": {
                    "card": 5,
                    "type": 2
                },
                "card3": {
                    "card": 2,
                    "type": 1
                }
            },
            "banker": {
                "card1": {
                    "card": 8,
                    "type": 2
                },
                "card2": {
                    "card": 4,
                    "type": 2
                },
                "card3": {
                    "card": 3,
                    "type": 0
                }
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": true,
            "bankerPair": false,
            "natural": false
        }
    },
    {
        "roundId": 2130086,
        "result": {
            "player": {
                "card1": {
                    "card": 9,
                    "type": 2
                },
                "card2": {
                    "card": 4,
                    "type": 0
                },
                "card3": {
                    "card": 0,
                    "type": 0
                }
            },
            "banker": {
                "card1": {
                    "card": 6,
                    "type": 0
                },
                "card2": {
                    "card": 5,
                    "type": 3
                },
                "card3": {
                    "card": 5,
                    "type": 0
                }
            }
        },
        "settlementResult": {
            "player": false,
            "banker": true,
            "big": true,
            "small": false,
            "tie": false,
            "playerPair": false,
            "bankerPair": false,
            "natural": false
        }
    }
];