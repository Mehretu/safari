import { Injectable } from '@nestjs/common';

interface SignupSession {
    userData: any;
    phoneVerificationCode: string;
    expiresAt: Date;
}

@Injectable()
export class SignupSessionService {
    private sessions: Map<string, SignupSession> = new Map();

    storeSession(phoneNumber: string, userData: any, verificationCode: string, expiresAt: Date) {
        this.sessions.set(phoneNumber, {
            userData,
            phoneVerificationCode: verificationCode,
            expiresAt
        });
    }

    getSession(phoneNumber: string) {
        return this.sessions.get(phoneNumber);
    }

    removeSession(phoneNumber: string) {
        this.sessions.delete(phoneNumber);
    }

    // Cleanup expired sessions periodically
    cleanupSessions() {
        const now = new Date();
        for (const [phoneNumber, session] of this.sessions.entries()) {
            if (session.expiresAt < now) {
                this.sessions.delete(phoneNumber);
            }
        }
    }
} 