import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api/v1");
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  app.enableCors({
    origin: [
      process.env.FRONTEND_ADMIN_URL ?? "http://localhost:5174",
      process.env.FRONTEND_SUPERADMIN_URL ?? "http://localhost:5175",
      "http://localhost:5173"
    ],
    credentials: true
  });

  const swagger = new DocumentBuilder()
    .setTitle("Bukolabs.io Scanner API")
    .setDescription(
      "Internal API for the Bukolabs.io Desktop Scanner & File Management System"
    )
    .setVersion("1.0.0")
    .addBearerAuth()
    .build();

  SwaggerModule.setup("api/docs", app, SwaggerModule.createDocument(app, swagger));

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
}

bootstrap();
