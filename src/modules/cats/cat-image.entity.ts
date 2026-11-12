import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Cat } from './cat.entity';

@Entity('cat_images')
@Check('"display_order" >= 1')
@Unique(['catId', 'displayOrder'])
export class CatImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cat_id', type: 'uuid' })
  catId: string;

  @ManyToOne(() => Cat, (cat) => cat.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cat_id' })
  cat: Cat;

  @Column({ name: 'image_url', type: 'text' })
  imageUrl: string;

  @Column({ name: 'alt_text', type: 'text' })
  altText: string;

  @Column({ name: 'display_order', type: 'int' })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
