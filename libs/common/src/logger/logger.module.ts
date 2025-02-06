import { Module } from "@nestjs/common";
import { Logger, LoggerModule as PinoLoggerModule } from 'nestjs-pino';


@Module({
    imports: [
        PinoLoggerModule.forRoot({
            pinoHttp: {
                transport: {
                    target: 'pino-pretty',
                    options: {
                        singleLine: true,
                    },
                },
            },
        }),
    ],
    providers: [Logger],
    exports: [Logger],
})
export class LoggerModule {}