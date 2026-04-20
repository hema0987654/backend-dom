import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert, AlertType } from './entities/alert.entity';
import { Product } from 'src/product/entities/product.entity';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly mailerService: MailerService,
  ) {}

  @Cron(CronExpression.EVERY_12_HOURS)
  async checkLowStock() {
    const products = await this.productRepository.find();

    for (const product of products) {
      if (product.quantity <= product.minQuantity) {
        const existingAlert = await this.alertRepository.findOne({
          where: {
            product: { id: product.id },
            type:
              product.quantity === 0
                ? AlertType.OUT_OF_STOCK
                : AlertType.LOW_STOCK,
            isRead: false,
          },
          relations: ['product'],
        });

        if (existingAlert) {
          console.log(
            `⚠️ Alert already exists for product ${product.name}: ${existingAlert.type}`,
          );
          continue;
        }

        const alert = this.alertRepository.create({
          product,
          type:
            product.quantity === 0
              ? AlertType.OUT_OF_STOCK
              : AlertType.LOW_STOCK,
          message:
            product.quantity === 0
              ? `Product ${product.name} is out of stock`
              : `Product ${product.name} is low on stock`,
        });

        await this.alertRepository.save(alert);
        console.log(
          `✅ Alert created for product ${product.name}: ${alert.type}`,
        );

        await this.mailerService.sendMail({
          to: 'ibrihem54321@gmail.com',
          subject: `🚨 ${alert.type === AlertType.OUT_OF_STOCK ? 'Out of Stock' : 'Low Stock'} Alert - ${product.name}`,
          html: `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 500px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); padding: 20px;">
      <div style="text-align: center;">
        <img src="https://img.icons8.com/color/96/${alert.type === AlertType.OUT_OF_STOCK ? 'delete-sign' : 'low-priority'}.png" alt="alert-icon" style="margin-bottom: 10px;" />
        <h2 style="color: ${alert.type === AlertType.OUT_OF_STOCK ? '#e74c3c' : '#f39c12'}; margin-bottom: 5px;">
          ${alert.type === AlertType.OUT_OF_STOCK ? 'Out of Stock' : 'Low Stock'} Alert
        </h2>
        <p style="font-size: 14px; color: #7f8c8d;">An important inventory update from your system</p>
      </div>
      
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />

      <p style="font-size: 16px; color: #2c3e50;">
        ${alert.message}
      </p>

      <div style="background-color: #f4f6f7; padding: 10px; border-radius: 8px; margin-top: 15px;">
        <p style="margin: 0; font-size: 14px;">
          📦 <strong>Product:</strong> ${product.name}<br/>
          📊 <strong>Quantity:</strong> ${product.quantity}<br/>
          🎯 <strong>Minimum Required:</strong> ${product.minQuantity}
        </p>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <a href="https://your-admin-dashboard-link.com" style="display: inline-block; background-color: ${alert.type === AlertType.OUT_OF_STOCK ? '#e74c3c' : '#f39c12'}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          View in Dashboard
        </a>
      </div>

      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
      <small style="display: block; text-align: center; color: #95a5a6;">
        This is an automated message. Please do not reply.
      </small>
    </div>
  </div>
  `,
        });
      }
    }
  }

  async findAll() {
    return await this.alertRepository.find({
      relations: ['product'],
    });
  }

  async markAsRead(id: number) {
    await this.alertRepository.update(id, { isRead: true });
    return { message: `Alert with id ${id} marked as read` };
  }

}