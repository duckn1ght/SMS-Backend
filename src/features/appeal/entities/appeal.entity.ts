import { AbstractEntity } from 'src/database/abstract.entity';
import { User } from 'src/features/user/entities/user.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, UpdateDateColumn } from 'typeorm';
import { APPEAL_STATUS, APPEAL_TYPE } from '../types/appeal.type';

@Entity({ name: 'appeals' })
export class Appeal extends AbstractEntity<Appeal> {
  @ManyToOne(() => User, (u) => u.appeals)
  @JoinColumn({ name: 'created_user_id' })
  createdUser: User;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  sum?: string;

  @Column({ nullable: true })
  who?: string;

  @Column({ name: 'how_send_money', nullable: true })
  howSendMoneny?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ name: 'communication_method', nullable: true })
  communicationMethod?: string;

  @Column({ nullable: true })
  when?: string;

  @Column({ name: 'help_ask', nullable: true })
  helpAsk?: string;

  @Column({ nullable: true })
  details?: string;

  @Column({ nullable: true })
  type?: APPEAL_TYPE;

  @Column({ default: APPEAL_STATUS.NEW })
  status: APPEAL_STATUS;

  @Column({ nullable: true })
  response?: string;

  @Column({ nullable: true })
  iin?: string;

  @Column({ nullable: true })
  fio?: string;

  @Column({ nullable: true })
  userPhone?: string;

  @Column({ nullable: true })
  region?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'fake_id', type: 'int', generated: 'increment' })
  fakeId: number;
}
