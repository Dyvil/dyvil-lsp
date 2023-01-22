import {NestFactory} from '@nestjs/core';
import {AppModule} from './app/app.module';
import {ConnectionService} from './app/connection/connection.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const connectionService = app.get(ConnectionService);
  connectionService.connection.listen();
}

bootstrap();
