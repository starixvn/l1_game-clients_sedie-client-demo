import { EventEmitter } from 'events';

class CardStateEmitter extends EventEmitter {
    private static instance: CardStateEmitter;

    private constructor() {
        super();
    }

    public static getInstance(): CardStateEmitter {
        if (!CardStateEmitter.instance) {
            CardStateEmitter.instance = new CardStateEmitter();
        }
        return CardStateEmitter.instance;
    }

    public emitOpenedCardsChange(count: number): void {
        this.emit('openedCardsChange', count);
    }

    public onOpenedCardsChange(callback: (count: number) => void): void {
        this.on('openedCardsChange', callback);
    }

    public removeOpenedCardsListener(callback: (count: number) => void): void {
        this.removeListener('openedCardsChange', callback);
    }
}

export const cardStateEmitter = CardStateEmitter.getInstance(); 