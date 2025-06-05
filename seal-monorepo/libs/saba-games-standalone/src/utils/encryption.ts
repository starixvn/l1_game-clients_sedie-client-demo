import CryptoJS from 'crypto-js';

export interface EncryptedMessage {
    encryptedData: string;
    iv: string;
}

export class MessageEncryption {
    private readonly key: string;

    constructor(encryptionKey: string) {
        this.key = encryptionKey;
    }

    encrypt(data: any): EncryptedMessage {
        const jsonString = JSON.stringify(data);
        const iv = CryptoJS.lib.WordArray.random(16);
        const encrypted = CryptoJS.AES.encrypt(jsonString, this.key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return {
            encryptedData: encrypted.toString(),
            iv: iv.toString()
        };
    }

    decrypt(encryptedMessage: EncryptedMessage): any {
        const { encryptedData, iv } = encryptedMessage;
        const decrypted = CryptoJS.AES.decrypt(encryptedData, this.key, {
            iv: CryptoJS.enc.Hex.parse(iv),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedString);
    }

    validateMessage(encryptedMessage: EncryptedMessage): boolean {
        try {
            this.decrypt(encryptedMessage);
            return true;
        } catch (error) {
            return false;
        }
    }
} 