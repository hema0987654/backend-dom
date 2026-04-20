import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { User, UserRole } from '../auth/entities/auth.entity';
import { Supplier } from '../supplier/entities/supplier.entity';
import { Product } from '../product/entities/product.entity';
import { Invoice, InvoiceType } from '../invoice/entities/invoice.entity';
import { InvoiceItem } from '../invoice-item/entities/invoice-item.entity';
import { Alert, AlertType } from '../alerts/entities/alert.entity';

type SeedConfig = {
  suppliers: number;
  products: number;
  invoices: number;
};

type ProductSeedModel = Product & { quantity: number };

const DEFAULT_CONFIG: SeedConfig = {
  suppliers: 7,
  products: 28,
  invoices: 16,
};

const EGYPTIAN_PHONE_PREFIXES = ['010', '011', '012', '015'];
const SUPPLIER_PREFIXES = [
  'Nile',
  'Cairo',
  'Delta',
  'Pyramid',
  'Falcon',
  'Atlas',
  'Phoenix',
  'Horizon',
  'Capital',
  'Prime',
];
const SUPPLIER_SUFFIXES = [
  'Traders',
  'Supply',
  'Distribution',
  'Logistics',
  'Partners',
  'Imports',
  'Wholesale',
  'Store',
  'Hub',
  'Market',
];

const PRODUCT_PREFIXES = [
  'Ultra',
  'Smart',
  'Eco',
  'Turbo',
  'Flex',
  'Pro',
  'Prime',
  'Hyper',
  'Core',
  'Nano',
];
const PRODUCT_CATEGORIES = [
  'Cable',
  'Adapter',
  'Notebook',
  'Printer',
  'Router',
  'Mouse',
  'Keyboard',
  'Monitor',
  'Speaker',
  'Scanner',
  'Headset',
  'SSD',
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function toMoney(value: number): number {
  return Number(value.toFixed(2));
}

function parseConfigFromArgs(): SeedConfig {
  const overrides = process.argv.slice(2).reduce<Partial<SeedConfig>>((acc, arg) => {
    const [key, rawValue] = arg.split('=');
    const value = Number.parseInt(rawValue || '', 10);

    if (!Number.isFinite(value) || value <= 0) {
      return acc;
    }

    if (key === '--suppliers') {
      acc.suppliers = value;
    }

    if (key === '--products') {
      acc.products = value;
    }

    if (key === '--invoices') {
      acc.invoices = value;
    }

    return acc;
  }, {});

  return {
    suppliers: overrides.suppliers ?? DEFAULT_CONFIG.suppliers,
    products: overrides.products ?? DEFAULT_CONFIG.products,
    invoices: overrides.invoices ?? DEFAULT_CONFIG.invoices,
  };
}

function buildPhone(): string {
  const prefix = pickOne(EGYPTIAN_PHONE_PREFIXES);
  const remaining = String(randomInt(10000000, 99999999));
  return `${prefix}${remaining}`;
}

function uniqueTag(): string {
  return `${Date.now()}${randomInt(100, 999)}`;
}

function createDataSource(): DataSource {
  const databaseUrl = process.env.DATABASE_URL;

  return new DataSource({
    type: 'postgres',
    url: databaseUrl,
    host: databaseUrl ? undefined : process.env.localhost || 'localhost',
    port: databaseUrl ? undefined : Number.parseInt(process.env.port || '5432', 10),
    username: databaseUrl ? undefined : process.env.username,
    password: databaseUrl ? undefined : process.env.password,
    database: databaseUrl ? undefined : process.env.database,
    entities: [User, Supplier, Product, Invoice, InvoiceItem, Alert],
    synchronize: false,
    ssl:
      databaseUrl || process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  });
}

async function ensureAdminUser(userRepository: Repository<User>): Promise<User> {
  const adminEmail = 'admin.seed@stockguard.local';
  const existing = await userRepository.findOne({ where: { email: adminEmail } });

  if (existing) {
    if (!existing.isOtpVerified || existing.role !== UserRole.ADMIN) {
      existing.isOtpVerified = true;
      existing.role = UserRole.ADMIN;
      existing.otpCode = null;
      existing.otpExpiresAt = null;
      await userRepository.save(existing);
    }
    return existing;
  }

  const passwordHash = await bcrypt.hash('Admin@12345', 10);
  const created = userRepository.create({
    fName: 'Seed Admin',
    email: adminEmail,
    password: passwordHash,
    phoneNumber: '01000000000',
    role: UserRole.ADMIN,
    address: 'Cairo, Egypt',
    profileImage: null,
    isOtpVerified: true,
    otpCode: null,
    otpExpiresAt: null,
  });

  return userRepository.save(created);
}

async function run(): Promise<void> {
  const config = parseConfigFromArgs();
  const seedTag = uniqueTag();
  const dataSource = createDataSource();

  await dataSource.initialize();

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const userRepository = queryRunner.manager.getRepository(User);
    const supplierRepository = queryRunner.manager.getRepository(Supplier);
    const productRepository = queryRunner.manager.getRepository(Product);
    const invoiceRepository = queryRunner.manager.getRepository(Invoice);
    const invoiceItemRepository = queryRunner.manager.getRepository(InvoiceItem);
    const alertRepository = queryRunner.manager.getRepository(Alert);

    const adminUser = await ensureAdminUser(userRepository);

    const suppliersToCreate = Array.from({ length: config.suppliers }).map((_, index) => {
      const supplierName = `${pickOne(SUPPLIER_PREFIXES)} ${pickOne(SUPPLIER_SUFFIXES)} ${index + 1}`;

      return supplierRepository.create({
        name: supplierName,
        phone: buildPhone(),
        address: `${randomInt(8, 220)} Tahrir St, Cairo`,
        email: `supplier.${seedTag}.${index + 1}@stockguard.local`,
      });
    });

    const suppliers = await supplierRepository.save(suppliersToCreate);

    const productsToCreate = Array.from({ length: config.products }).map((_, index) => {
      const buyPrice = toMoney(randomInt(25, 900) + Math.random());
      const sellPrice = toMoney(buyPrice + randomInt(8, 160));
      const quantity = randomInt(2, 180);
      const minQuantity = randomInt(4, 20);

      return productRepository.create({
        name: `${pickOne(PRODUCT_PREFIXES)} ${pickOne(PRODUCT_CATEGORIES)} ${index + 1}`,
        sku: `SKU-${seedTag}-${String(index + 1).padStart(4, '0')}`,
        buyPrice,
        sellPrice,
        quantity,
        minQuantity,
        supplier: pickOne(suppliers),
      });
    });

    const products = (await productRepository.save(productsToCreate)) as ProductSeedModel[];

    let createdInvoiceItems = 0;

    for (let invoiceIndex = 0; invoiceIndex < config.invoices; invoiceIndex += 1) {
      const invoiceType = Math.random() > 0.45 ? InvoiceType.SALE : InvoiceType.PURCHASE;
      const maxItems = randomInt(1, 4);
      const shuffledProducts = [...products].sort(() => Math.random() - 0.5);
      const selectedItems: Array<{ product: ProductSeedModel; quantity: number; unitPrice: number }> = [];

      for (const product of shuffledProducts) {
        if (selectedItems.length >= maxItems) {
          break;
        }

        const maxQty =
          invoiceType === InvoiceType.SALE
            ? Math.min(product.quantity, 12)
            : 12;

        if (maxQty < 1) {
          continue;
        }

        const quantity = randomInt(1, maxQty);
        const unitPrice =
          invoiceType === InvoiceType.SALE ? product.sellPrice : product.buyPrice;

        if (invoiceType === InvoiceType.SALE) {
          product.quantity -= quantity;
        } else {
          product.quantity += quantity;
        }

        selectedItems.push({ product, quantity, unitPrice });
      }

      if (selectedItems.length === 0) {
        continue;
      }

      const totalAmount = toMoney(
        selectedItems.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice,
          0,
        ),
      );

      const invoice = await invoiceRepository.save(
        invoiceRepository.create({
          type: invoiceType,
          totalAmount,
          createdBy: adminUser,
        }),
      );

      const invoiceItems = selectedItems.map((item) =>
        invoiceItemRepository.create({
          invoice,
          product: item.product,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }),
      );

      await invoiceItemRepository.save(invoiceItems);
      createdInvoiceItems += invoiceItems.length;
    }

    await productRepository.save(products);

    const alertsToCreate = products
      .filter((product) => product.quantity <= product.minQuantity)
      .map((product) => {
        const alertType =
          product.quantity === 0 ? AlertType.OUT_OF_STOCK : AlertType.LOW_STOCK;

        return alertRepository.create({
          product,
          type: alertType,
          message:
            alertType === AlertType.OUT_OF_STOCK
              ? `Product ${product.name} is out of stock`
              : `Product ${product.name} is low on stock`,
          isRead: false,
        });
      });

    await alertRepository.save(alertsToCreate);

    await queryRunner.commitTransaction();

    console.log('Seed completed successfully.');
    console.log(`Admin email: admin.seed@stockguard.local`);
    console.log(`Admin password: Admin@12345`);
    console.log(`Suppliers added: ${suppliers.length}`);
    console.log(`Products added: ${products.length}`);
    console.log(`Invoices added: ${config.invoices}`);
    console.log(`Invoice items added: ${createdInvoiceItems}`);
    console.log(`Alerts added: ${alertsToCreate.length}`);
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error('Seed failed:', message);
  process.exit(1);
});
