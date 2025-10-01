import { AbstractEntity } from 'src/database/abstract.entity';
import { Column, CreateDateColumn, Entity, OneToMany, UpdateDateColumn } from 'typeorm';
import { CLIENT_TYPE, USER_ROLE } from '../types/user.types';
import { Blacklist } from 'src/features/blacklist/entities/blacklist.entity';
import { Whitelist } from 'src/features/whitelist/entities/whitelist.entity';
import { Report } from 'src/features/report/entities/report.entity';
import { Appeal } from 'src/features/appeal/entities/appeal.entity';
import { ActionLog } from 'src/features/action-log/entities/action-log.entity';
import { SmsBanWord } from 'src/features/sms/entities/sms-ban-word.entity';
import { Detection } from 'src/features/phone/entities/detection.entity';

@Entity({ name: 'users' })
export class User extends AbstractEntity<User> {
  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  password?: string;

  @Column()
  role: USER_ROLE;

  @Column({ name: 'client_type' })
  clientType: CLIENT_TYPE;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'sms_confirmed', default: false })
  smsConfirmed: boolean;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true, default: 'Павлодарская область' })
  region?: string;

  @Column({ nullable: true })
  position?: string;

  @Column({ nullable: true })
  organization?: string;

  @Column({ nullable: true, name: 'firebase_token' })
  firebaseToken?: string;

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

  @OneToMany(() => ActionLog, (l) => l.user)
  logs: ActionLog[];

  @OneToMany(() => SmsBanWord, (s) => s.createdUser)
  smsBanWords: SmsBanWord[];

  @OneToMany(() => SmsBanWord, (s) => s.createdUser)
  createdSmsTemplates: SmsBanWord[];

  @Column({ name: 'fake_id', type: 'int', generated: 'increment' })
  fakeId: number;

  @OneToMany(() => Detection, (d) => d.createdUser)
  detections: Detection[];
}
