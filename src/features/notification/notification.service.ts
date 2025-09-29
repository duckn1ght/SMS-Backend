import { Injectable, HttpException, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { join } from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(User)
    private readonly userRep: Repository<User>,
    private readonly logger: Logger,
  ) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(require(join(__dirname, '../../../firebase-service-account.json'))),
      });
    }
  }

  async sendPush(userId: string, title: string, body: string) {
    const user = await this.userRep.findOne({ where: { id: userId } });
    if (!user || !user.firebaseToken) {
      this.logger.debug(
        `У пользователя ${user?.name} отсутсвует firebaseToken, для отправки уведомления`,
        'NotificationService',
      );
      return;
    }
    const message = {
      token: user.firebaseToken,
      notification: { title, body },
    };
    return await admin.messaging().send(message);
  }
}
