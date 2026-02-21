import './register';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DatabaseExceptionFilter } from './common/filters/database-exception.filter';
import * as dotenv from 'dotenv';
import { createConnection } from 'mysql2/promise';
import * as path from 'path';

// Cargar .env desde la raíz del backend
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function ensureDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3305', 10);
  const user = process.env.DB_USERNAME || 'catequista';
  const password = process.env.DB_PASSWORD || '1234';
  const database = process.env.DB_DATABASE || 'parroquia_db';

  console.log(`🔌 Conectando a MySQL en ${host}:${port} como ${user}`);
  console.log(`📊 Base de datos: ${database}`);

  const connection = await createConnection({
    host,
    port,
    user,
    password,
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
  );
  await connection.end();
}

async function bootstrap() {
  await ensureDatabase();
  const app = await NestFactory.create(AppModule);

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  });

  // Global exception filters
  app.useGlobalFilters(new DatabaseExceptionFilter());

  // Validation Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Catequesis API')
    .setDescription('API para gestión de catequesis en parroquias')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Autenticación y autorización')
    .addTag('Configuration', 'Configuración base del sistema')
    .addTag('Persons', 'Gestión de personas')
    .addTag('Academic', 'Módulo académico')
    .addTag('Attendance', 'Asistencias y encuentros')
    .addTag('Events', 'Eventos parroquiales')
    .addTag('Enrollment', 'Matrículas')
    .addTag('Users', 'Gestión de usuarios')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Servidor ejecutándose en http://localhost:${port}`);
  console.log(`📚 Documentación disponible en http://localhost:${port}/api/docs`);
}

bootstrap();
