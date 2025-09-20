import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AndroidJwtGuard extends AuthGuard('jwt-android') {}