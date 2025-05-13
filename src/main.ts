import * as morgan from 'morgan'
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NotAcceptableException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if(process.env?.NODE_ENV?.trim() == "develompent") {
    app.use(morgan('tiny'));
  }

  app.setGlobalPrefix('/api')

  app.enableCors({
    allowedHeaders: ['authorizing'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    optionSuccesStatus: 200,
    origin: (reqOrigin, cb) => {
      const allowedOrigins = process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',')
      : ['*'];
      if(allowedOrigins.includes(reqOrigin) || allowedOrigins.includes('*')) {
        return cb(null, reqOrigin);
      } else
        cb(
          new NotAcceptableException(
            `${reqOrigin} ga so'rov yuborishga ruxsat yo'q`,
          ),
        );
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Users API')
    .setDescription('The users API description')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);

  if(process.env?.NODE_ENV?.trim() == 'development') {
    SwaggerModule.setup('api', app, documentFactory);
  }

  const port = process.env.APP_PORT ? (process.env.APP_PORT) : 4000
  await app.listen(port, () => {
    console.log(`Server running on port ${port} ✅`);
    
  })
}
bootstrap();
