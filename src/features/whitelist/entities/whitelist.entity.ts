import { AbstractEntity } from 'src/database/abstract.entity';
import { User } from 'src/features/user/entities/user.entity';
import { Entity, ManyToOne, Column, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';

@Entity()
export class Whitelist extends AbstractEntity<Whitelist> {
  /** Тот, кто создал запись номера в БС */
  @ManyToOne(() => User, (user) => user.createdBlacklist)
  @JoinColumn({ name: 'created_user_id' })
  createdUser: User;

  @Column()
  phone: string;

  @Column()
  organization: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: string;

  @Column({ name: 'fake_id', type: 'int', generated: 'increment' })
  fakeId: number;
}
