import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';
import { MilestonesService } from './milestones.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';

@UseGuards(JwtAuthGuard)
@Controller('milestones')
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateMilestoneDto) {
    return this.milestonesService.create(user.userId, dto);
  }

  @Get()
  findAllByWeek(@CurrentUser() user: RequestUser) {
    return this.milestonesService.findAllByWeek(user.userId);
  }

  @Delete(':id')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.milestonesService.remove(user.userId, id);
  }
}
