import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { ConfigurationModule } from '@modules/configuration/configuration.module';
import { PersonsModule } from '@modules/persons/persons.module';
import { AcademicModule } from '@modules/academic/academic.module';
import { AttendanceModule } from '@modules/attendance/attendance.module';
import { EventsModule } from '@modules/events/events.module';
import { EnrollmentModule } from '@modules/enrollment/enrollment.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from '@config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule,
    UsersModule,
    ConfigurationModule,
    PersonsModule,
    AcademicModule,
    AttendanceModule,
    EventsModule,
    EnrollmentModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
