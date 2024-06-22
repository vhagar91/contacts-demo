import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import * as session from "express-session"
import * as passport from "passport"


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      credentials: true,
      origin: true
    }
  });
  app.setGlobalPrefix('api');
  
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(new ValidationPipe());
  app.use(
    session({
      name: "contacts-session-id",
      secret: process.env.AUTH_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: Number(process.env.SESSION_COOKIE_MAX_AGE) },
    })
  );
  app.use(passport.initialize())
  app.use(passport.session())
  const config = new DocumentBuilder()
    .setTitle('Contacts')
    .setDescription('The Contacts API description')
    .setVersion('1.0')
    .addCookieAuth('contacts-session-id')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
}
bootstrap();
