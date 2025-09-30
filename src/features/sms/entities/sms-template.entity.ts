import { AbstractEntity } from 'src/database/abstract.entity';
import { Column, CreateDateColumn, Entity, ManyToOne } from 'typeorm';
import { SMS_TEMPLATE_STATUS } from '../types/sms-template-status.type';
import { User } from 'src/features/user/entities/user.entity';

@Entity('sms_templates')
export class SmsTemplate extends AbstractEntity<SmsTemplate> {
  @ManyToOne(() => User, (u) => u.createdSmsTemplates)
  createdUser: User;

  @Column()
  text: string;

  @Column({ type: 'enum', enum: SMS_TEMPLATE_STATUS, default: SMS_TEMPLATE_STATUS.UNKNOWN })
  status: SMS_TEMPLATE_STATUS;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'fake_id', type: 'int', generated: 'increment' })
  fakeId: number;
}
