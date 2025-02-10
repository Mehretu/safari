import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
    imports: [
        MailerModule.forRootAsync({
            useFactory: (config: ConfigService) => {
                // Get config values with defaults
                const host = config.get<string>('MAIL_HOST') || 'sandbox.smtp.mailtrap.io';
                const port = config.get<number>('MAIL_PORT') || 2525;
                const user = config.get<string>('MAIL_USER') || '';
                const pass = config.get<string>('MAIL_PASSWORD') || '';
                const from = config.get<string>('MAIL_FROM') || 'noreply@example.com';

                return {
                    transport: {
                        host,
                        port,
                        secure: false,
                        auth: {
                            user,
                            pass,
                        },
                        tls: {
                            ciphers: 'SSLv3'
                        }
                    },
                    defaults: {
                        from: `"No Reply" <${from}>`,
                    },
                    template: {
                        dir: join(process.cwd(), 'libs/common/src/mail/templates'),
                        adapter: new HandlebarsAdapter(),
                        options: {
                            strict: true,
                        },
                    },
                };
            },
            inject: [ConfigService],
        }),
    ],
    exports: [MailerModule]
})
export class MailModule {}