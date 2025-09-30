import { AbstractEntity } from 'src/database/abstract.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ACTION_LOG_TYPE } from '../types/action-log.type';
import { User } from 'src/features/user/entities/user.entity';

@Entity({ name: 'action_logs' })
export class ActionLog extends AbstractEntity<ActionLog> {
  @ManyToOne(() => User, (u) => u.logs)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  type: ACTION_LOG_TYPE;

  @Column()
  message: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
