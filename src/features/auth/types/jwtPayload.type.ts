import { CLIENT_TYPE, USER_ROLE } from 'src/features/user/types/user.types';

export type JwtPayload = {
  id: string;
  name: string;
  role: USER_ROLE;
  client_type: CLIENT_TYPE;
};
