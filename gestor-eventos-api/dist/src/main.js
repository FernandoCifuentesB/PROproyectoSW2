"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)());
    app.enableCors({
        origin: true,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.getHttpAdapter().getInstance().get("/__whoami", (_req, res) => {
        res.json({ app: "gestor-eventos-api", pid: process.pid, time: new Date().toISOString() });
    });
    await app.listen(4000, "0.0.0.0");
    console.log("API escuchando en http://0.0.0.0:4000");
}
bootstrap();
//# sourceMappingURL=main.js.map