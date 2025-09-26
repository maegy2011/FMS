import { db } from './db';

async function main() {
  // Create demo users
  const adminUser = await db.user.create({
    data: {
      email: 'admin@fms.com',
      name: 'مدير النظام',
      role: 'ADMIN',
      active: true,
    },
  });

  const managerUser = await db.user.create({
    data: {
      email: 'manager@fms.com',
      name: 'مدير مالي',
      role: 'MANAGER',
      active: true,
    },
  });

  const accountantUser = await db.user.create({
    data: {
      email: 'accountant@fms.com',
      name: 'محاسب',
      role: 'ACCOUNTANT',
      active: true,
    },
  });

  const viewerUser = await db.user.create({
    data: {
      email: 'viewer@fms.com',
      name: 'مراقب',
      role: 'VIEWER',
      active: true,
    },
  });

  // Create demo accounts
  const cashAccount = await db.account.create({
    data: {
      name: 'الصندوق',
      code: 'CASH-001',
      type: 'ASSET',
      balance: 10000,
      currency: 'SAR',
      active: true,
    },
  });

  const bankAccount = await db.account.create({
    data: {
      name: 'حساب البنك',
      code: 'BANK-001',
      type: 'ASSET',
      balance: 50000,
      currency: 'SAR',
      active: true,
    },
  });

  const revenueAccount = await db.account.create({
    data: {
      name: 'الإيرادات',
      code: 'REV-001',
      type: 'REVENUE',
      balance: 0,
      currency: 'SAR',
      active: true,
    },
  });

  const expenseAccount = await db.account.create({
    data: {
      name: 'المصروفات',
      code: 'EXP-001',
      type: 'EXPENSE',
      balance: 0,
      currency: 'SAR',
      active: true,
    },
  });

  // Create demo parties (جهات)
  const customer1 = await db.party.create({
    data: {
      name: 'شركة التقنية المتقدمة',
      type: 'CUSTOMER',
      code: 'CUST-001',
      email: 'info@techcompany.com',
      phone: '0112345678',
      mobile: '0501234567',
      address: 'الرياض، المملكة العربية السعودية',
      city: 'الرياض',
      country: 'المملكة العربية السعودية',
      status: 'ACTIVE',
      creditLimit: 50000,
      balance: 0,
      currency: 'SAR',
    },
  });

  const customer2 = await db.party.create({
    data: {
      name: 'مؤسسة التجارة الحديثة',
      type: 'CUSTOMER',
      code: 'CUST-002',
      email: 'contact@moderntrade.com',
      phone: '0123456789',
      mobile: '0512345678',
      address: 'جدة، المملكة العربية السعودية',
      city: 'جدة',
      country: 'المملكة العربية السعودية',
      status: 'ACTIVE',
      creditLimit: 30000,
      balance: 0,
      currency: 'SAR',
    },
  });

  const supplier1 = await db.party.create({
    data: {
      name: 'شركة المستلزمات المكتبية',
      type: 'SUPPLIER',
      code: 'SUP-001',
      email: 'sales@officesupplies.com',
      phone: '0134567890',
      mobile: '0523456789',
      address: 'الدمام، المملكة العربية السعودية',
      city: 'الدمام',
      country: 'المملكة العربية السعودية',
      status: 'ACTIVE',
      balance: 0,
      currency: 'SAR',
    },
  });

  const partner1 = await db.party.create({
    data: {
      name: 'بنك الاستثمار العربي',
      type: 'BANK',
      code: 'BANK-001',
      email: 'info@arabinvestment.com',
      phone: '0145678901',
      address: 'الرياض، المملكة العربية السعودية',
      city: 'الرياض',
      country: 'المملكة العربية السعودية',
      status: 'ACTIVE',
      balance: 0,
      currency: 'SAR',
    },
  });

  // Create demo categories
  const salesCategory = await db.category.create({
    data: {
      name: 'المبيعات',
      description: 'فئة المبيعات',
      color: '#10b981',
    },
  });

  const operatingCategory = await db.category.create({
    data: {
      name: 'المصروفات التشغيلية',
      description: 'المصروفات التشغيلية',
      color: '#f59e0b',
    },
  });

  const servicesCategory = await db.category.create({
    data: {
      name: 'الخدمات',
      description: 'فئة الخدمات',
      color: '#8b5cf6',
    },
  });

  const investmentsCategory = await db.category.create({
    data: {
      name: 'الاستثمارات',
      description: 'فئة الاستثمارات',
      color: '#06b6d4',
    },
  });

  // Create demo revenue sources
  const salesRevenueSource = await db.revenueSource.create({
    data: {
      name: 'مبيعات المنتجات',
      description: 'إيرادات من مبيعات المنتجات التقنية',
      type: 'SALES',
      category: 'منتجات',
      isRecurring: true,
      frequency: 'monthly',
      amount: 15000,
      currency: 'SAR',
      active: true,
      accountId: revenueAccount.id,
      categoryId: salesCategory.id,
      partyId: customer1.id,
    },
  });

  const servicesRevenueSource = await db.revenueSource.create({
    data: {
      name: 'خدمات استشارية',
      description: 'إيرادات من الخدمات الاستشارية',
      type: 'SERVICES',
      category: 'استشارات',
      isRecurring: true,
      frequency: 'monthly',
      amount: 8000,
      currency: 'SAR',
      active: true,
      accountId: revenueAccount.id,
      categoryId: servicesCategory.id,
      partyId: customer2.id,
    },
  });

  const investmentsRevenueSource = await db.revenueSource.create({
    data: {
      name: 'عوائد الاستثمارات',
      description: 'عوائد من الاستثمارات المالية',
      type: 'INVESTMENTS',
      category: 'استثمارات',
      isRecurring: true,
      frequency: 'quarterly',
      amount: 5000,
      currency: 'SAR',
      active: true,
      accountId: revenueAccount.id,
      categoryId: investmentsCategory.id,
      partyId: partner1.id,
    },
  });

  const rentalRevenueSource = await db.revenueSource.create({
    data: {
      name: 'إيجار العقارات',
      description: 'إيرادات من تأجير العقارات',
      type: 'RENTAL',
      category: 'عقارات',
      isRecurring: true,
      frequency: 'monthly',
      amount: 3000,
      currency: 'SAR',
      active: true,
      accountId: revenueAccount.id,
    },
  });

  // Create demo revenues
  await db.revenue.create({
    data: {
      reference: 'REV-001',
      sourceId: salesRevenueSource.id,
      amount: 15000,
      currency: 'SAR',
      description: 'إيراد مبيعات شهر يناير',
      date: new Date('2024-01-31'),
      status: 'RECEIVED',
      receivedDate: new Date('2024-01-31'),
      accountId: cashAccount.id,
      categoryId: salesCategory.id,
      partyId: customer1.id,
      userId: adminUser.id,
    },
  });

  await db.revenue.create({
    data: {
      reference: 'REV-002',
      sourceId: servicesRevenueSource.id,
      amount: 8000,
      currency: 'SAR',
      description: 'إيراد خدمات استشارية شهر يناير',
      date: new Date('2024-01-31'),
      status: 'RECEIVED',
      receivedDate: new Date('2024-01-31'),
      accountId: cashAccount.id,
      categoryId: servicesCategory.id,
      partyId: customer2.id,
      userId: managerUser.id,
    },
  });

  await db.revenue.create({
    data: {
      reference: 'REV-003',
      sourceId: investmentsRevenueSource.id,
      amount: 5000,
      currency: 'SAR',
      description: 'عوائد استثمارات الربع الأول',
      date: new Date('2024-03-31'),
      status: 'PENDING',
      dueDate: new Date('2024-03-31'),
      accountId: bankAccount.id,
      categoryId: investmentsCategory.id,
      partyId: partner1.id,
      userId: accountantUser.id,
    },
  });

  await db.revenue.create({
    data: {
      reference: 'REV-004',
      sourceId: rentalRevenueSource.id,
      amount: 3000,
      currency: 'SAR',
      description: 'إيراد إيجار شهر فبراير',
      date: new Date('2024-02-28'),
      status: 'OVERDUE',
      dueDate: new Date('2024-02-28'),
      accountId: cashAccount.id,
      userId: adminUser.id,
    },
  });

  // Create demo transactions
  await db.transaction.create({
    data: {
      reference: 'TRX-001',
      type: 'INCOME',
      amount: 5000,
      currency: 'SAR',
      description: 'إيراد من المبيعات',
      date: new Date(),
      status: 'COMPLETED',
      accountId: cashAccount.id,
      userId: adminUser.id,
      categoryId: salesCategory.id,
      partyId: customer1.id,
    },
  });

  await db.transaction.create({
    data: {
      reference: 'TRX-002',
      type: 'EXPENSE',
      amount: 2000,
      currency: 'SAR',
      description: 'إيجار المكتب',
      date: new Date(),
      status: 'COMPLETED',
      accountId: cashAccount.id,
      userId: managerUser.id,
      categoryId: operatingCategory.id,
      partyId: supplier1.id,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });