import { Injectable, HttpException } from '@nestjs/common';
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
	) {
		if (!admin.apps.length) {
			admin.initializeApp({
				credential: admin.credential.cert(
					require(join(__dirname, '../../../firebase-service-account.json')),
				),
			});
		}
	}

	async sendPush(userId: string, title: string, body: string) {
		const user = await this.userRep.findOne({ where: { id: userId } });
		if (!user || !user.firebaseToken) {
			throw new HttpException('Firebase токен пользователя не найден', 404);
		}
		const message = {
			token: user.firebaseToken,
			notification: { title, body },
		};
		return await admin.messaging().send(message);
	}
}
