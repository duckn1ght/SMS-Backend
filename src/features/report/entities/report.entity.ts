import { AbstractEntity } from 'src/database/abstract.entity';
import { Blacklist } from 'src/features/blacklist/entities/blacklist.entity';
import { User } from 'src/features/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';

@Entity('reports')
export class Report extends AbstractEntity<Report> {
  @ManyToOne(() => Blacklist, (b) => b.reports)
  blacklist: Blacklist;

  @ManyToOne(() => User, (u) => u.createdReports)
  @JoinColumn({ name: 'created_user' })
  createdUser: User;

  @Column({ nullable: true })
  comment?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: string;
}
