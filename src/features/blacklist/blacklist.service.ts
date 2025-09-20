import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blacklist } from './entities/blacklist.entity';
import { Repository } from 'typeorm';
import { BLACKLIST_SELECT } from 'src/const/selects';

@Injectable()
export class BlackListService {
  constructor(
    @InjectRepository(Blacklist)
    private readonly blacklistRep: Repository<Blacklist>,
  ) {}
  
  async get() {
    return await this.blacklistRep.find({
      relations: { createdUser: true },
      select: BLACKLIST_SELECT,
    });
  }

  async getOneByNumber(phone: string) {
    return await this.blacklistRep.findOne({
      where: { phone },
      relations: { createdUser: true },
      select: BLACKLIST_SELECT,
    });
  }

  async getOneById(id: string) {
    return await this.blacklistRep.findOne({
      where: { id },
      relations: { createdUser: true },
      select: BLACKLIST_SELECT,
    });
  }

  async reportNumber(phone: string) {}

  async update() {}
}
