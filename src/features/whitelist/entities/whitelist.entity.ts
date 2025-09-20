import { BLACKLIST_STATUS } from 'src/features/blacklist/types/blacklist.types';
import { User } from 'src/features/user/entities/user.entity';
import {
  Entity,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Whitelist {
  /** Тот, кто создал запись номера в ЧС */
  @ManyToOne(() => User, (user) => user.createdBlacklist)
  @JoinColumn({ name: 'created_user' })
  createdUser: User;

  @Column()
  phone: string;

  @Column({ nullable: true })
  comment?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: string;
}
