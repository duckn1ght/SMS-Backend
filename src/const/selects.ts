import { ActionLog } from 'src/features/action-log/entities/action-log.entity';
import { Blacklist } from 'src/features/blacklist/entities/blacklist.entity';
import { Report } from 'src/features/report/entities/report.entity';
import { SmsTemplate } from 'src/features/sms/entities/sms-template.entity';
import { User } from 'src/features/user/entities/user.entity';
import { Whitelist } from 'src/features/whitelist/entities/whitelist.entity';
import { FindOptionsSelect } from 'typeorm';

export const USER_SELECT: FindOptionsSelect<User> = {
  id: true,
  name: true,
  phone: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  organization: true,
  position: true,
  isActive: true,
  email: true,
  region: true,
  fakeId: true,
};

export const BLACKLIST_SELECT: FindOptionsSelect<Blacklist> = {
  id: true,
  phone: true,
  comment: true,
  createdUser: USER_SELECT,
  reports: true,
  status: true,
  createdAt: true,
  fakeId: true,
  updatedAt: true,
};

export const WHITELIST_SELECT: FindOptionsSelect<Whitelist> = {
  id: true,
  phone: true,
  organization: true,
  createdUser: USER_SELECT,
  createdAt: true,
  updatedAt: true,
  fakeId: true,
};

export const REPORT_SELECT: FindOptionsSelect<Report> = {
  id: true,
  comment: true,
  createdUser: USER_SELECT,
  blacklist: BLACKLIST_SELECT,
  createdAt: true,
  fakeId: true,
  updatedAt: true,
};

export const ACTION_LOG_SELECT: FindOptionsSelect<ActionLog> = {
  id: true,
  message: true,
  type: true,
  user: USER_SELECT,
  createdAt: true,
};

export const SMS_TEMPLATE_SELECT: FindOptionsSelect<SmsTemplate> = {
  id: true,
  text: true,
  status: true,
  createdUser: USER_SELECT,
  createdAt: true,
  fakeId: true,
};
