export interface PFClientSetting {
    randomClientSeedEnabled: boolean;
    manualClientSeed: string;
    randomClientSeed: string;
}

export interface CrashSingleClientSeed {
    nickname: string;
    clientSeed: string;
}

export interface CrashPFVerfication {
    roundId: number;
    serverSeedHash: string;
    result?: number;
    serverSeed?: string;
    clientSeeds?: CrashSingleClientSeed[];
    mergeSeed?: string;
    finalHash?: string;
}

export enum VerificationMode {
    History = 0,
    LatestRounds = 1,
}

export interface OpenVerification {
    mode: VerificationMode;
    roundId?: number;
}
