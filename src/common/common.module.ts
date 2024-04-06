import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { PrismaService } from './prisma.serivce';
import { ValidationService } from './validation.service';

const customFormat = winston.format.printf(
  (log) =>
    `[${log.timestamp}] -> [${log.level}] : ${JSON.stringify(log.message)}`,
);

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss A' }),
        winston.format.metadata({
          fillExcept: ['message', 'level', 'timestamp'],
        }),
        winston.format.colorize(),
        customFormat,
      ),
      transports: [new winston.transports.Console({})],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [PrismaService, ValidationService],
  exports: [PrismaService, ValidationService],
})
export class CommonModule {}
