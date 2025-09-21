import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class UniversalJwtGuard extends AuthGuard(['jwt-web', 'jwt-android']) {
  canActivate(context: ExecutionContext) {
    // Попытается использовать обе стратегии
    return super.canActivate(context);
  }
}
