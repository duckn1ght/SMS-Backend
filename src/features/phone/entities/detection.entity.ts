import { AbstractEntity } from 'src/database/abstract.entity';
import { Column, CreateDateColumn, Entity, ManyToOne } from 'typeorm';
import { DETECTION_TYPE } from '../types/detection.type';
import { User } from 'src/features/user/entities/user.entity';

@Entity({ name: 'detections' })
export class Detection extends AbstractEntity<Detection> {
  @Column()
  type: DETECTION_TYPE;

  @ManyToOne(() => User, (u) => u.detections)
  createdUser: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
