import { NestFactory } from '@nestjs/core';
import * as rateLimit from 'express-rate-limit';
import * as compression from 'compression';
import * as helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('/api');
  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 1 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
    })
  );
  app.use(compression()); // 启用 gzip 压缩
  app.use(helmet()); // helmet是一个保护Node.JS应用的安全项目
  app.useGlobalInterceptors(new TransformInterceptor()); // 正常情况下，响应值统一
  app.useGlobalFilters(new HttpExceptionFilter()); // 异常情况下，响应值统一

  const config = new DocumentBuilder()
    .setTitle('Wipi Open Api')
    .setDescription('Wipi Open Api Document')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(4000);
}

bootstrap();
