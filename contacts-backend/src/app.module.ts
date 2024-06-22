import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import ormConfigs from './orm/orm.configs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import ormConfigsProd from './orm/orm.configs.prod';

@Module({
  imports: [
    ConfigModule.forRoot(
      {
        isGlobal: true,
        load: [ormConfigs],
        expandVariables: true,
        envFilePath: `.env.${process.env.NODE_ENV}`
      }
    ),
    TypeOrmModule.forRootAsync({
      useFactory: process.env.NODE_ENV !== "prod" ? ormConfigs : ormConfigsProd
    }),
    UsersModule,
    AuthModule,
    ContactsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
