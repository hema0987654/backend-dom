import { Product } from "src/product/entities/product.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';

export enum AlertType {
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
}

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.alerts, { 
    eager: false,
    onDelete: 'CASCADE',
    nullable: false
  })
  product: Product;

  @Column({
    type: 'enum',
    enum: AlertType,
    default: AlertType.LOW_STOCK
  })
  type: AlertType;

  @Column({ type: 'text', nullable: true })
  message: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ default: false })
  @Index()
  isRead: boolean;
}