import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cat } from '../cats/cat.entity';

@Entity('characteristics')
export class Characteristic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true })
  code: string;

  @Column({ name: 'label_masculine', type: 'text' })
  labelMasculine: string;

  @Column({ name: 'label_feminine', type: 'text' })
  labelFeminine: string;

  @ManyToMany(() => Cat, (cat) => cat.characteristics, { onDelete: 'RESTRICT' })
  cats: Cat[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
