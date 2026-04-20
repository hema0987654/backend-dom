import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../auth/entities/auth.entity';
import { InvoiceItem } from 'src/invoice-item/entities/invoice-item.entity';

export enum InvoiceType {
  PURCHASE = 'purchase',
  SALE = 'sale',
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: InvoiceType,
  })
  type: InvoiceType;

  @Column({ type: 'float' })
  totalAmount: number;

  @OneToMany(() => InvoiceItem, (item) => item.invoice,{eager: true}) 
  invoiceItems: InvoiceItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;
}