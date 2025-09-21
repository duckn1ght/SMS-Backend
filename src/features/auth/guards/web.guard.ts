import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class WebJwtGuard extends AuthGuard('jwt-web') {}
