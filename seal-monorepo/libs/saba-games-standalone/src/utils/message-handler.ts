import { MessageEncryption, EncryptedMessage } from './encryption';

export interface MessageHandlerConfig {
    encryptionKey: string;
    onMessage: (data: any) => void;
}

export class MessageHandler {
    private messageEncryption: MessageEncryption;
    private onMessage: (data: any) => void;

    constructor(config: MessageHandlerConfig) {
        this.messageEncryption = new MessageEncryption(config.encryptionKey);
        this.onMessage = config.onMessage;
        this.initialize();
    }

    private initialize() {
        window.addEventListener('message', this.handleMessage.bind(this));
    }

    private handleMessage(event: MessageEvent) {
        try {
            const encryptedMessage = event.data as EncryptedMessage;
            if (!this.messageEncryption.validateMessage(encryptedMessage)) {
                console.warn('Received invalid encrypted message');
                return;
            }

            const data = this.messageEncryption.decrypt(encryptedMessage);
            this.onMessage(data);
        } catch (error) {
            console.error('Error processing message:', error);
        }
    }

    public sendMessage(data: any) {
        const encryptedMessage = this.messageEncryption.encrypt(data);
        window.parent.postMessage(encryptedMessage, '*');
    }

    public destroy() {
        window.removeEventListener('message', this.handleMessage.bind(this));
    }
} 