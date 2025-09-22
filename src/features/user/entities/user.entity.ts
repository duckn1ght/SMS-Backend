import { AbstractEntity } from 'src/database/abstract.entity';
import { Column, CreateDateColumn, Entity, OneToMany, UpdateDateColumn } from 'typeorm';
import { CLIENT_TYPE, USER_ROLE } from '../types/user.types';
import { Blacklist } from 'src/features/blacklist/entities/blacklist.entity';
import { Whitelist } from 'src/features/whitelist/entities/whitelist.entity';
import { Report } from 'src/features/report/entities/report.entity';
import { Appeal } from 'src/features/appeal/entities/appeal.entity';

@Entity({ name: 'users' })
export class User extends AbstractEntity<User> {
  @Column()
  phone: string;

  @Column()
  password: string;

  @Column()
  role: USER_ROLE;

  @Column({ name: 'client_type' })
  clientType: CLIENT_TYPE;

  @Column({ nullable: true })
  name?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Blacklist, (bl) => bl.createdUser)
  createdBlacklist: Blacklist[];

  @OneToMany(() => Whitelist, (bl) => bl.createdUser)
  createdWhitelist: Whitelist[];

  @OneToMany(() => Report, (r) => r.createdUser)
  createdReports: Report[];

  @OneToMany(() => Appeal, (a) => a.createdUser)
  appeals: Appeal[];
}
