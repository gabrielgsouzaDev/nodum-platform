import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { StockModule } from '../stock/stock.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, StockModule],
  providers: [TasksService],
})
export class TasksModule {}
