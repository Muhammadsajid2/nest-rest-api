import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../decorators';
import { CreateKhataDto, CreateKhataTransactionDto, UpdateKhataTransactionDto } from './dto';
import { KhataService } from './khata.service';

@Controller('khatas')
@UseGuards(AuthGuard('jwt'))
export class KhataController {
  constructor(private readonly khataService: KhataService) {}

  @Get('participants')
  findParticipantOptions(@CurrentUser() user: any, @Query('search') search = '') { return this.khataService.findParticipantOptions(user, search); }

  @Post()
  create(@Body() dto: CreateKhataDto, @CurrentUser() user: any) { return this.khataService.create(dto, user); }

  @Get()
  findAll(@CurrentUser() user: any) { return this.khataService.findAll(user); }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) { return this.khataService.getDetail(id, user); }

  @Get(':id/transactions')
  findTransactions(@Param('id') id: string, @CurrentUser() user: any) { return this.khataService.getTransactions(id, user); }

  @Get(':id/activities')
  findActivities(@Param('id') id: string, @CurrentUser() user: any) { return this.khataService.getActivities(id, user); }

  @Post(':id/transactions')
  addTransaction(@Param('id') id: string, @Body() dto: CreateKhataTransactionDto, @CurrentUser() user: any) { return this.khataService.addTransaction(id, dto, user); }

  @Patch(':id/transactions/:transactionId')
  updateTransaction(@Param('id') id: string, @Param('transactionId') transactionId: string, @Body() dto: UpdateKhataTransactionDto, @CurrentUser() user: any) { return this.khataService.updateTransaction(id, transactionId, dto, user); }

  @Delete(':id/transactions/:transactionId')
  archiveTransaction(@Param('id') id: string, @Param('transactionId') transactionId: string, @CurrentUser() user: any) { return this.khataService.archiveTransaction(id, transactionId, user); }

  @Post(':id/archive')
  archiveKhata(@Param('id') id: string, @CurrentUser() user: any) { return this.khataService.archiveKhata(id, user); }
}
