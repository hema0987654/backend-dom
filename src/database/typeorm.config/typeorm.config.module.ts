import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      host: process.env.DATABASE_URL ? undefined : process.env.localhost,
      port: process.env.DATABASE_URL ? undefined : parseInt(process.env.port || '5432', 10),
      username: process.env.DATABASE_URL ? undefined : process.env.username,
      password: process.env.DATABASE_URL ? undefined : process.env.password,
      database: process.env.DATABASE_URL ? undefined : process.env.database,
      autoLoadEntities: true,
      synchronize: true,
      ssl:
        process.env.DATABASE_URL || process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    }),
  ],
})
export class DataBaseModuleTsModule {}
