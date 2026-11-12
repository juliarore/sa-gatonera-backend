import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Characteristic } from '../characteristics/characteristic.entity';
import { ActivityLevel, CatGender, CatStatus, Compatibility } from './enums';

@Entity('cats')
export class Cat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'enum', enum: CatGender })
  gender: CatGender;

  @Column({ type: 'text' })
  story: string;

  @Column({ name: 'entry_date', type: 'date' })
  entryDate: string;

  @Column({ name: 'health_status', type: 'text' })
  healthStatus: string;

  @Column({ name: 'special_needs', type: 'text', nullable: true })
  specialNeeds: string | null;

  @Column({ name: 'birth_date', type: 'date' })
  birthDate: string;

  @Column({ name: 'birth_date_is_estimated', type: 'boolean' })
  birthDateIsEstimated: boolean;

  @Column({ type: 'boolean' })
  vaccinated: boolean;

  @Column({ type: 'boolean' })
  sterilized: boolean;

  @Column({
    name: 'compatible_with_cats',
    type: 'enum',
    enum: Compatibility,
    enumName: 'cats_compatibility_enum',
    default: Compatibility.UNKNOWN,
  })
  compatibleWithCats: Compatibility;

  @Column({
    name: 'compatible_with_dogs',
    type: 'enum',
    enum: Compatibility,
    enumName: 'cats_compatibility_enum',
    default: Compatibility.UNKNOWN,
  })
  compatibleWithDogs: Compatibility;

  @Column({
    name: 'compatible_with_children',
    type: 'enum',
    enum: Compatibility,
    enumName: 'cats_compatibility_enum',
    default: Compatibility.UNKNOWN,
  })
  compatibleWithChildren: Compatibility;

  @Column({
    name: 'activity_level',
    type: 'enum',
    enum: ActivityLevel,
  })
  activityLevel: ActivityLevel;

  @Index()
  @Column({ name: 'adoption_group_id', type: 'uuid', nullable: true })
  adoptionGroupId: string | null;

  @Column({
    type: 'enum',
    enum: CatStatus,
    default: CatStatus.AVAILABLE,
  })
  status: CatStatus;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_urgent', type: 'boolean', default: false })
  isUrgent: boolean;

  @ManyToMany(() => Characteristic, (characteristic) => characteristic.cats, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'cat_characteristics',
    joinColumn: { name: 'cat_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'characteristic_id', referencedColumnName: 'id' },
  })
  characteristics: Characteristic[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
