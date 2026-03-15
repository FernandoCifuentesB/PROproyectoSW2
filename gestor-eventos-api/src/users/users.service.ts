import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsersReport() {
    const users = await this.prisma.user.findMany({
      orderBy: [
        { role: "asc" },
        { name: "asc" },
      ],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      admins: users.filter((u) => u.role === "ADMIN"),
      users: users.filter((u) => u.role === "USER"),
    };
  }
}