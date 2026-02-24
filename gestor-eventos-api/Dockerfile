# Usamos Node 20
FROM node:20

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el proyecto
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Exponer puerto
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "run", "start:dev"]