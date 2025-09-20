import { Blacklist } from 'src/features/blacklist/entities/blacklist.entity';
import { User } from 'src/features/user/entities/user.entity';
import { Whitelist } from 'src/features/whitelist/entities/whitelist.entity';
import { FindOptionsSelect } from 'typeorm';

export let USER_SELECT: FindOptionsSelect<User> = {
  id: true,
  name: true,
  phone: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

export const BLACKLIST_SELECT: FindOptionsSelect<Blacklist> = {
  id: true,
  phone: true,
  comment: true,
  createdUser: USER_SELECT,
  reportCount: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

export const WHITELIST_SELECT: FindOptionsSelect<Whitelist> = {
  id: true,
  phone: true,
  comment: true,
  createdUser: USER_SELECT,
  createdAt: true,
  updatedAt: true,
};