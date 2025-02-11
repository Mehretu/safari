import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class TwilioService {
    private client: twilio.Twilio;
    private readonly logger = new Logger(TwilioService.name);

    constructor(private configService: ConfigService) {
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        this.client = twilio(accountSid, authToken);
    }

    async sendSMS(to: string, message: string) {
        this.logger.debug(`[DEV MODE] SMS to ${to}: ${message}`);

        // try {
        //     const result = await this.client.messages.create({
        //         body: message,
        //         to: to,  // Phone number to send to
        //         from: this.configService.get('TWILIO_PHONE_NUMBER'),  // Your Twilio phone number
        //     });

        //     this.logger.debug(`SMS sent to ${to}, Message SID: ${result.sid}`);
        //     return result;
        // } catch (error) {
        //     this.logger.error(`Failed to send SMS to ${to}: ${error.message}`);
        //     throw error;
        // }
    }
} 