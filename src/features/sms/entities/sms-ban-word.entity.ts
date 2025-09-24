import { AbstractEntity } from 'src/database/abstract.entity';
import { User } from 'src/features/user/entities/user.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'sms_ban_words' })
export class SmsBanWord extends AbstractEntity<SmsBanWord> {
  @ManyToOne(() => User, (u) => u.smsBanWords)
  @JoinColumn({ name: 'created_user_id' })
  createdUser: User;

  @Column()
  word: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
