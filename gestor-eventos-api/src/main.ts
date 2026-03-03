import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.getHttpAdapter().getInstance().get("/__whoami", (_req, res) => {
    res.json({ app: "gestor-eventos-api", pid: process.pid, time: new Date().toISOString() });
  });
  await app.listen(4000, "0.0.0.0");
  console.log("API escuchando en http://0.0.0.0:4000");
}
bootstrap();