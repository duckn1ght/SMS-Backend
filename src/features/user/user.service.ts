import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { USER_ROLE } from './types/user.types';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRep: Repository<User>,
  ) {}

  async getPartners(take?: number, skip?: number) {
    const options = { where: { role: USER_ROLE.PARTNER } };
    if (take) Object.assign(options, { take });
    if (skip) Object.assign(options, { skip });
    const [data, total] = await this.userRep.findAndCount(options);
    return {
      data,
      total,
      take,
      skip,
    };
  }
}
