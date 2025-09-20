import { AbstractEntity } from 'src/database/abstract.entity';
import { User } from 'src/features/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import type { BLACKLIST_STATUS } from '../types/blacklist.types';
import { Report } from 'src/features/report/entities/report.entity';

@Entity()
export class Blacklist extends AbstractEntity<Blacklist> {
  /** Тот, кто создал запись номера в ЧС */
  @ManyToOne(() => User, (user) => user.createdBlacklist)
  @JoinColumn({ name: 'created_user' })
  createdUser: User;

  @Column()
  phone: string;

  @Column()
  status: BLACKLIST_STATUS;

  @Column({ nullable: true })
  comment?: string;

  @OneToMany(() => Report, (r) => r.blacklist)
  reports: Report[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: string;
}
