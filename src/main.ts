import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RapidocModule } from '@b8n/nestjs-rapidoc';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT ?? 3000;

  setupCors(app, ['http://localhost:8080']);
  setupValidate(app);
  setupPrefixAndVersioning(app);
  setupDocs(app);

  await app.listen(PORT, () => {
    console.log(
      `🚀 Server is running on ${PORT} port\n📄 Documentation: \n* Swagger: http://localhost:${PORT}/api\n* RapiDocs: http://localhost:${PORT}/rapi`,
    );
  });
}
bootstrap();
  
async function setupCors(app: INestApplication<any>, hosts: string[]) {
  app.enableCors({
    origin: hosts,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });
}

async function setupDocs(app: INestApplication<any>) {
  const config = new DocumentBuilder()
    .setTitle(process.env.DOC_TITLE ?? 'API')
    .setDescription(process.env.DOC_DESCRIPTION ?? 'API Documentation')
    .setVersion(process.env.DOC_VERSION ?? '1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  RapidocModule.setup('rapi', app, document);
  SwaggerModule.setup('api', app, document);
}

async function setupValidate(app: INestApplication<any>) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
}

async function setupPrefixAndVersioning(app: INestApplication<any>) {
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
}
