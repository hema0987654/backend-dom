import { Alert } from 'src/alerts/entities/alert.entity';
import { InvoiceItem } from '../../invoice-item/entities/invoice-item.entity';
import { Supplier } from '../../supplier/entities/supplier.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  sku: string;

  @Column({ name: 'buy_price', type: 'float' })
  buyPrice: number;

  @Column({ name: 'sell_price', type: 'float' })
  sellPrice: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'min_quantity', type: 'int', default: 5 })
  minQuantity: number;


  @ManyToOne(() => Supplier, (supplier) => supplier.products,{eager:false})
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @OneToMany(() => InvoiceItem, (invoiceItem) => invoiceItem.product)
  invoiceItems: InvoiceItem[];

  @OneToMany(() => Alert, (alert) => alert.product)
  alerts: Alert[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}