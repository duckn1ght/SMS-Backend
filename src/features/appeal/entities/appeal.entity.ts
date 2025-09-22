import { AbstractEntity } from 'src/database/abstract.entity';
import { User } from 'src/features/user/entities/user.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, UpdateDateColumn } from 'typeorm';
import { APPEAL_STATUS, APPEAL_TYPE } from '../types/appeal.type';

@Entity({ name: 'appeals' })
export class Appeal extends AbstractEntity<Appeal> {
  @ManyToOne(() => User, (u) => u.appeals)
  @JoinColumn({ name: 'created_user_id' })
  createdUser: User;

  @Column()
  phone: string;

  @Column()
  text: string;

  @Column()
  type: APPEAL_TYPE;

  @Column()
  status: APPEAL_STATUS;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
