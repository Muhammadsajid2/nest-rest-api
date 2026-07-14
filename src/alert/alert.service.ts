import { Injectable } from '@nestjs/common';
import { IFindByIdQueryParams, IPaginationQueryParams } from '../decorators';
import { stringToObject } from 'src/util/string-to-object.util';
import { AlertRepository } from './alert.repository';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { Alert } from './schemas/alert.schema';

@Injectable()
export class AlertService {
  constructor(private readonly alertRepository: AlertRepository) {}

  private async deactivateOtherAlerts(excludeId?: string) {
    const filter = excludeId
      ? { _id: { $ne: excludeId }, status: true }
      : { status: true };

    await this.alertRepository.updateMany(filter, { status: false });
  }

  async create(createAlertDto: CreateAlertDto): Promise<Alert> {
    if (createAlertDto.status) {
      await this.deactivateOtherAlerts();
    }

    return this.alertRepository.create(createAlertDto) as Promise<Alert>;
  }

  async findAll(paginationQueryParams: IPaginationQueryParams) {
    const { limit, offset, sort, filter, populate, populateSelect, search } =
      paginationQueryParams;

    return this.alertRepository.findPaginatedLean(
      {
        ...filter,
        ...(search ? { label: { $regex: search, $options: 'i' } } : {}),
      },
      {
        skip: offset,
        limit,
        sort: stringToObject(sort),
        populate,
        populateSelect,
      },
    );
  }

  async findOne(
    id: string,
    queryParams?: IFindByIdQueryParams,
  ): Promise<Alert> {
    const { populate, populateSelect } = queryParams || {};

    return this.alertRepository.findById(id, {
      populate,
      populateSelect,
    });
  }

  async update(id: string, updateAlertDto: UpdateAlertDto): Promise<Alert> {
    if (updateAlertDto.status) {
      await this.deactivateOtherAlerts(id);
    }

    return this.alertRepository.updateById(id, updateAlertDto);
  }

  async remove(id: string): Promise<boolean> {
    return this.alertRepository.deleteOne({ _id: id });
  }
}
