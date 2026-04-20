import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'Admin',
  SELLER = 'Seller',
  STOREMAN = 'Storeman',
  ACCOUNTANT = 'Accountant',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'f_name', type: 'varchar', length: 100 })
  fName!: string;

  @Column({ type: 'varchar', length: 70, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 60 })
  password!: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 20, nullable: true })
  phoneNumber!: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.SELLER,
  })
  role!: UserRole;

  @Column({ type: 'text', nullable: true })
  address!: string | null;

  @Column({ name: 'profile_image', type: 'text', nullable: true })
  profileImage!: string | null;

  @Column({ name: 'is_otp_verified', type: 'boolean', default: false })
  isOtpVerified!: boolean;

  @Column({ name: 'otp_code', type: 'varchar', length: 6, nullable: true })
  otpCode!: string | null;

  @Column({ name: 'otp_expires_at', type: 'timestamp', nullable: true })
  otpExpiresAt!: Date | null;

  @Column({ name: 'reset_password_code', type: 'varchar', length: 6, nullable: true })
  resetPasswordCode!: string | null;

  @Column({ name: 'reset_password_expires_at', type: 'timestamp', nullable: true })
  resetPasswordExpiresAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
