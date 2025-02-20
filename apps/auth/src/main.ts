import { NestFactory } from "@nestjs/core";
import { AuthModule } from "./auth.module";
import { ConfigService } from "@nestjs/config";
import { Transport } from '@nestjs/microservices';
import * as cookieParser from "cookie-parser";
import { Logger } from "nestjs-pino";
import { ValidationPipe } from "@nestjs/common";


async function bootstrap() {
    const app = await NestFactory.create(AuthModule);
    const configService = app.get(ConfigService);
    app.use(cookieParser(configService.get('JWT_SECRET')));
    app.connectMicroservice({
        transport: Transport.TCP,
        options: {
            host: '0.0.0.0',
            port: configService.get('TCP_PORT'),
        },
    });
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true
    }));
    app.useLogger(app.get(Logger));
    await app.startAllMicroservices();
    await app.listen(configService.get('HTTP_PORT') || 3000);
}
bootstrap();