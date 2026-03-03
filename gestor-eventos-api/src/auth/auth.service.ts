import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(input: { name: string; email: string; password: string }) {
    const exists = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (exists) throw new BadRequestException("El email ya está registrado.");

    const hash = await bcrypt.hash(input.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hash,
        role: "USER",
      },
      select: { id: true, name: true, email: true, role: true },
    });

    const token = this.jwt.sign({ sub: user.id, role: user.role });
    return { token, user };
  }

  async login(input: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !user.isActive) throw new UnauthorizedException("Credenciales inválidas.");

    const ok = await bcrypt.compare(input.password, user.password);
    if (!ok) throw new UnauthorizedException("Credenciales inválidas.");

    const token = this.jwt.sign({ sub: user.id, role: user.role });
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }
}