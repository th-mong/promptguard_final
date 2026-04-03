import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { globalValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
  });

  app.use(helmet({
    contentSecurityPolicy: false,
  }));

  app.use(require('express').json({ limit: '1mb' }));

  app.useGlobalPipes(globalValidationPipe);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // 🔥 핵심 수정 부분
  app.enableCors({
    origin: true, // ⭐ 모든 origin 허용 (지금 상황 최적)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key'],
  });

  const config = app.get(ConfigService);
  const nodeEnv = config.get<string>('app.nodeEnv', 'development');

  if (nodeEnv !== 'production') {
    const swagger = new DocumentBuilder()
      .setTitle('Prompt Guard API')
      .setDescription('관리자 룰 관리 및 활성 룰 배포 API')
      .setVersion('1.0')
      .addApiKey(
        { type: 'apiKey', name: 'x-admin-key', in: 'header' },
        'x-admin-key',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swagger);
    SwaggerModule.setup('docs', app, document);
    console.log(`📄 Swagger 문서 → http://localhost:${config.get<number>('app.port', 3000)}/docs`);
  } else {
    console.log('📄 Swagger 비활성화 (production 환경)');
  }

  const port = config.get<number>('app.port', 3000);

  await app.listen(port);
  console.log(`✅ Prompt Guard API 실행 중 → http://localhost:${port}`);
}

bootstrap();