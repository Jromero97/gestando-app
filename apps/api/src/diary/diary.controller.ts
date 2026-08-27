import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';
import { DiaryService } from './diary.service';
import { UpsertDiaryEntryDto } from './dto/upsert-diary-entry.dto';
import { AddDiaryPhotoDto } from './dto/add-diary-photo.dto';

@UseGuards(JwtAuthGuard)
@Controller('diary')
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  @Get('day')
  getDay(@CurrentUser() user: RequestUser, @Query('date') date: string) {
    return this.diaryService.getDay(user.userId, date);
  }

  @Put('day')
  upsertDay(@CurrentUser() user: RequestUser, @Body() dto: UpsertDiaryEntryDto) {
    return this.diaryService.upsertEntry(user.userId, dto);
  }

  @Get('month')
  getMonthMarks(
    @CurrentUser() user: RequestUser,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.diaryService.getMonthMarks(user.userId, parseInt(year, 10), parseInt(month, 10));
  }

  @Post('photos')
  addPhoto(@CurrentUser() user: RequestUser, @Body() dto: AddDiaryPhotoDto) {
    return this.diaryService.addPhoto(user.userId, dto);
  }

  @Delete('photos/:id')
  removePhoto(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.diaryService.removePhoto(user.userId, id);
  }
}
