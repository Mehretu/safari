import { NestFactory } from '@nestjs/core';
import { VehiclesModule } from './vehicles.module';

async function bootstrap() {
  const app = await NestFactory.create(VehiclesModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
