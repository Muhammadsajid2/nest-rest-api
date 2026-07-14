import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import {
  FindByIdQueryParams,
  IFindByIdQueryParams,
  IPaginationQueryParams,
  PaginationQueryParams,
} from '../decorators';
import { AlertService } from './alert.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';

@Controller('alert')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Post()
  create(@Body() createAlertDto: CreateAlertDto, @Req() req: any) {
    createAlertDto.createdBy = req.user?._id || req.user?.id;
    return this.alertService.create(createAlertDto);
  }

  @Get()
  findAll(
    @PaginationQueryParams() paginationQueryParams: IPaginationQueryParams,
  ) {
    return this.alertService.findAll(paginationQueryParams);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @FindByIdQueryParams() queryParams: IFindByIdQueryParams,
  ) {
    return this.alertService.findOne(id, queryParams);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAlertDto: UpdateAlertDto) {
    return this.alertService.update(id, updateAlertDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.alertService.remove(id);
  }
}
