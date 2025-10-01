import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/features/user/entities/user.entity';
import { CLIENT_TYPE, USER_ROLE } from 'src/features/user/types/user.types';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(User)
    private readonly userRep: Repository<User>,
  ) {}

  private ADMIN_EMAIL = process.env['ADMIN_EMAIL'];
  private ADMIN_PASSWORD = process.env['ADMIN_PASSWORD'];

  async seed() {
    const existingAdmin = await this.userRep.findOne({
      where: { email: this.ADMIN_EMAIL },
    });

    if (!existingAdmin) {
      await this.createAdminUser();
    }
  }

  createAdminUser() {
    const hashedPassword = bcrypt.hashSync(this.ADMIN_PASSWORD || 'qwerty', 10);
    return this.userRep.save({
      email: this.ADMIN_EMAIL,
      name: 'Admin',
      password: hashedPassword,
      role: USER_ROLE.ADMIN,
      clientType: CLIENT_TYPE.WEB,
      smsConfirmed: true,
    });
  }
}
