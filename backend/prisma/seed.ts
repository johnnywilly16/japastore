import { PrismaClient } from '../generated/prisma';
import { hashPassword } from '../src/utils/bcrypt.utils';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Limpar dados existentes (opcional - comentar se quiser manter dados)
  console.log('🧹 Cleaning existing data...');
  await prisma.contactInteractions.deleteMany();
  await prisma.contacts.deleteMany();
  await prisma.customerVisits.deleteMany();
  await prisma.serviceOrdersCost.deleteMany();
  await prisma.serviceOrders.deleteMany();
  await prisma.sales.deleteMany();
  await prisma.products.deleteMany();
  await prisma.customers.deleteMany();
  await prisma.dailySessions.deleteMany();
  await prisma.users.deleteMany();
  await prisma.categories.deleteMany({
    where: {
      id: {
        not: 1,
      },
    },
  });

  // 1. Criar Categorias
  console.log('📦 Creating categories...');
  const categories = [
    { id: 1, name: 'Sem Categoria' },
    { id: 2, name: 'Smartphones' },
    { id: 3, name: 'iPhone' },
    { id: 4, name: 'Samsung' },
    { id: 5, name: 'Xiaomi' },
    { id: 6, name: 'Acessórios' },
    { id: 7, name: 'Capas' },
    { id: 8, name: 'Carregadores' },
    { id: 9, name: 'Fones de Ouvido' },
    { id: 10, name: 'Peças de Reposição' },
    { id: 11, name: 'Telas' },
    { id: 12, name: 'Baterias' },
  ];

  for (const category of categories) {
    await prisma.categories.upsert({
      where: { id: category.id },
      update: {},
      create: category,
    });
  }
  console.log(`✅ Created ${categories.length} categories`);

  // 2. Criar Usuários
  console.log('👤 Creating users...');
  const users = [
    {
      id: 1,
      name: 'Administrador',
      email: 'admin@japaphone.com',
      passwordHash: await hashPassword('admin123'),
    },
    {
      id: 2,
      name: 'João Silva',
      email: 'joao@japaphone.com',
      passwordHash: await hashPassword('senha123'),
    },
    {
      id: 3,
      name: 'Maria Santos',
      email: 'maria@japaphone.com',
      passwordHash: await hashPassword('senha123'),
    },
  ];

  for (const user of users) {
    await prisma.users.upsert({
      where: { id: user.id },
      update: {},
      create: user,
    });
  }
  console.log(`✅ Created ${users.length} users`);

  // 3. Criar Produtos
  console.log('📱 Creating products...');
  const products = [
    {
      id: 1,
      categoryId: 3,
      name: 'iPhone 15 Pro Max 256GB',
      stockQuantity: 5,
      unitPrice: 8999.99,
      description: 'iPhone 15 Pro Max com 256GB de armazenamento',
    },
    {
      id: 2,
      categoryId: 3,
      name: 'iPhone 14 128GB',
      stockQuantity: 8,
      unitPrice: 5999.99,
      description: 'iPhone 14 com 128GB de armazenamento',
    },
    {
      id: 3,
      categoryId: 4,
      name: 'Samsung Galaxy S24 Ultra',
      stockQuantity: 3,
      unitPrice: 7999.99,
      description: 'Samsung Galaxy S24 Ultra 256GB',
    },
    {
      id: 4,
      categoryId: 5,
      name: 'Xiaomi 13 Pro',
      stockQuantity: 10,
      unitPrice: 3999.99,
      description: 'Xiaomi 13 Pro 256GB',
    },
    {
      id: 5,
      categoryId: 7,
      name: 'Capa iPhone 15 Pro Max',
      stockQuantity: 25,
      unitPrice: 89.99,
      description: 'Capa protetora para iPhone 15 Pro Max',
    },
    {
      id: 6,
      categoryId: 8,
      name: 'Carregador USB-C 20W',
      stockQuantity: 30,
      unitPrice: 79.99,
      description: 'Carregador rápido USB-C 20W',
    },
    {
      id: 7,
      categoryId: 9,
      name: 'AirPods Pro 2',
      stockQuantity: 12,
      unitPrice: 1999.99,
      description: 'AirPods Pro 2ª geração',
    },
    {
      id: 8,
      categoryId: 11,
      name: 'Tela iPhone 14 Original',
      stockQuantity: 15,
      unitPrice: 899.99,
      description: 'Tela original de reposição para iPhone 14',
    },
    {
      id: 9,
      categoryId: 12,
      name: 'Bateria iPhone 13',
      stockQuantity: 20,
      unitPrice: 299.99,
      description: 'Bateria original de reposição para iPhone 13',
    },
    {
      id: 10,
      categoryId: 6,
      name: 'Película Vidro iPhone 15',
      stockQuantity: 50,
      unitPrice: 39.99,
      description: 'Película de vidro temperado para iPhone 15',
    },
  ];

  for (const product of products) {
    await prisma.products.create({
      data: product,
    });
  }
  console.log(`✅ Created ${products.length} products`);

  // 4. Criar Clientes
  console.log('👥 Creating customers...');
  const customers = [
    {
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@email.com',
      phone: '(11) 98765-4321',
      cpf: '123.456.789-00',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      customerType: 'vip' as const,
      totalSpent: 15000.0,
      totalVisits: 5,
      lastVisit: new Date('2024-01-15'),
      averageDaysBetweenVisits: 30,
      preferredPaymentMethod: 'credit_card',
    },
    {
      name: 'Ana Paula Costa',
      email: 'ana.costa@email.com',
      phone: '(11) 97654-3210',
      cpf: '234.567.890-11',
      address: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      customerType: 'regular' as const,
      totalSpent: 6500.0,
      totalVisits: 3,
      lastVisit: new Date('2024-01-10'),
      averageDaysBetweenVisits: 45,
      preferredPaymentMethod: 'pix',
    },
    {
      name: 'Roberto Alves',
      email: 'roberto.alves@email.com',
      phone: '(11) 96543-2109',
      cpf: '345.678.901-22',
      address: 'Rua Augusta, 500',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01305-000',
      customerType: 'occasional' as const,
      totalSpent: 2500.0,
      totalVisits: 2,
      lastVisit: new Date('2023-12-20'),
      averageDaysBetweenVisits: 60,
      preferredPaymentMethod: 'debit_card',
    },
    {
      name: 'Fernanda Lima',
      email: 'fernanda.lima@email.com',
      phone: '(11) 95432-1098',
      cpf: '456.789.012-33',
      address: 'Rua Consolação, 200',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01302-000',
      customerType: 'new' as const,
      totalSpent: 0.0,
      totalVisits: 0,
      preferredPaymentMethod: 'pix',
    },
    {
      name: 'Pedro Henrique',
      email: 'pedro.henrique@email.com',
      phone: '(11) 94321-0987',
      cpf: '567.890.123-44',
      address: 'Av. Faria Lima, 1500',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01452-000',
      customerType: 'regular' as const,
      totalSpent: 8500.0,
      totalVisits: 4,
      lastVisit: new Date('2024-01-12'),
      averageDaysBetweenVisits: 35,
      preferredPaymentMethod: 'credit_card',
    },
  ];

  const createdCustomers = [];
  for (const customer of customers) {
    const created = await prisma.customers.create({
      data: customer,
    });
    createdCustomers.push(created);
  }
  console.log(`✅ Created ${createdCustomers.length} customers`);

  // 5. Criar Vendas
  console.log('💰 Creating sales...');
  const sales = [
    {
      customerId: createdCustomers[0].id,
      productId: 1,
      quantity: 1,
      unitPrice: 8999.99,
      totalAmount: 8999.99,
      discount: 0,
      paymentMethod: 'credit_card',
      saleDate: new Date('2024-01-15'),
      notes: 'Cliente VIP - desconto aplicado',
    },
    {
      customerId: createdCustomers[0].id,
      productId: 7,
      quantity: 1,
      unitPrice: 1999.99,
      totalAmount: 1999.99,
      discount: 0,
      paymentMethod: 'credit_card',
      saleDate: new Date('2024-01-15'),
    },
    {
      customerId: createdCustomers[1].id,
      productId: 2,
      quantity: 1,
      unitPrice: 5999.99,
      totalAmount: 5999.99,
      discount: 500.0,
      paymentMethod: 'pix',
      saleDate: new Date('2024-01-10'),
    },
    {
      customerId: createdCustomers[1].id,
      productId: 5,
      quantity: 2,
      unitPrice: 89.99,
      totalAmount: 179.98,
      discount: 0,
      paymentMethod: 'pix',
      saleDate: new Date('2024-01-10'),
    },
    {
      customerId: createdCustomers[2].id,
      productId: 4,
      quantity: 1,
      unitPrice: 3999.99,
      totalAmount: 3999.99,
      discount: 0,
      paymentMethod: 'debit_card',
      saleDate: new Date('2023-12-20'),
    },
    {
      customerId: createdCustomers[4].id,
      productId: 3,
      quantity: 1,
      unitPrice: 7999.99,
      totalAmount: 7999.99,
      discount: 0,
      paymentMethod: 'credit_card',
      saleDate: new Date('2024-01-12'),
    },
    {
      customerId: createdCustomers[4].id,
      productId: 6,
      quantity: 1,
      unitPrice: 79.99,
      totalAmount: 79.99,
      discount: 0,
      paymentMethod: 'credit_card',
      saleDate: new Date('2024-01-12'),
    },
  ];

  const createdSales = [];
  for (const sale of sales) {
    const created = await prisma.sales.create({
      data: sale,
    });
    createdSales.push(created);

    // Atualizar estoque
    await prisma.products.update({
      where: { id: sale.productId },
      data: {
        stockQuantity: {
          decrement: sale.quantity,
        },
      },
    });
  }
  console.log(`✅ Created ${createdSales.length} sales`);

  // 6. Criar Ordens de Serviço
  console.log('🔧 Creating service orders...');
  const serviceOrders = [
    {
      customerId: createdCustomers[0].id,
      deviceModel: 'iPhone 13 Pro',
      problem: 'Tela quebrada - precisa troca',
      estimatedCost: 899.99,
      priority: 'high' as const,
      status: 'inProgress' as const,
      createdAt: new Date('2024-01-16'),
    },
    {
      customerId: createdCustomers[1].id,
      deviceModel: 'Samsung Galaxy S21',
      problem: 'Bateria não carrega - troca de bateria necessária',
      estimatedCost: 299.99,
      priority: 'medium' as const,
      status: 'pending' as const,
      createdAt: new Date('2024-01-17'),
    },
    {
      customerId: createdCustomers[2].id,
      deviceModel: 'iPhone 12',
      problem: 'Câmera traseira com defeito',
      estimatedCost: 450.0,
      priority: 'low' as const,
      status: 'completed' as const,
      completionDate: new Date('2024-01-18'),
      createdAt: new Date('2024-01-10'),
    },
  ];

  const createdServiceOrders = [];
  for (const order of serviceOrders) {
    const created = await prisma.serviceOrders.create({
      data: order,
    });
    createdServiceOrders.push(created);
  }
  console.log(`✅ Created ${createdServiceOrders.length} service orders`);

  // 8. Criar Custos das Ordens de Serviço
  console.log('💵 Creating service order costs...');
  await prisma.serviceOrdersCost.create({
    data: {
      serviceOrderId: createdServiceOrders[0].id,
      productId: 8,
      description: 'Tela iPhone 13 Pro Original',
      value: 899.99,
      quantity: 1,
      type: 'stockProduct',
    },
  });

  await prisma.serviceOrdersCost.create({
    data: {
      serviceOrderId: createdServiceOrders[1].id,
      productId: 9,
      description: 'Bateria Samsung Galaxy S21',
      value: 299.99,
      quantity: 1,
      type: 'stockProduct',
    },
  });

  await prisma.serviceOrdersCost.create({
    data: {
      serviceOrderId: createdServiceOrders[2].id,
      productId: null,
      description: 'Mão de obra - reparo câmera',
      value: 200.0,
      quantity: 1,
      type: 'externalService',
    },
  });

  await prisma.serviceOrdersCost.create({
    data: {
      serviceOrderId: createdServiceOrders[2].id,
      productId: null,
      description: 'Peça câmera traseira',
      value: 250.0,
      quantity: 1,
      type: 'externalService',
    },
  });

  const serviceOrderCostsCount = 4;
  console.log(`✅ Created ${serviceOrderCostsCount} service order costs`);

  // 9. Criar Visitas de Clientes
  console.log('🚶 Creating customer visits...');
  const customerVisits = [
    {
      customerId: createdCustomers[0].id,
      visitDate: new Date('2024-01-15'),
      visitType: 'purchase' as const,
      notes: 'Compra de iPhone 15 Pro Max e AirPods',
    },
    {
      customerId: createdCustomers[0].id,
      visitDate: new Date('2023-12-15'),
      visitType: 'service' as const,
      notes: 'Consulta sobre reparo de iPhone',
    },
    {
      customerId: createdCustomers[1].id,
      visitDate: new Date('2024-01-10'),
      visitType: 'purchase' as const,
      notes: 'Compra de iPhone 14',
    },
    {
      customerId: createdCustomers[2].id,
      visitDate: new Date('2023-12-20'),
      visitType: 'purchase' as const,
      notes: 'Compra de Xiaomi 13 Pro',
    },
    {
      customerId: createdCustomers[4].id,
      visitDate: new Date('2024-01-12'),
      visitType: 'purchase' as const,
      notes: 'Compra de Samsung Galaxy S24 Ultra',
    },
  ];

  for (const visit of customerVisits) {
    await prisma.customerVisits.create({
      data: visit,
    });
  }
  console.log(`✅ Created ${customerVisits.length} customer visits`);

  // 10. Criar Sessões Diárias
  console.log('📅 Creating daily sessions...');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dailySessions = [
    {
      userId: 1,
      date: today,
      startTime: new Date(today.setHours(8, 0, 0, 0)),
      endTime: new Date(today.setHours(18, 0, 0, 0)),
      status: 'completed' as const,
      totalSales: 8999.99,
      salesCount: 1,
      notes: 'Dia produtivo',
    },
    {
      userId: 1,
      date: yesterday,
      startTime: new Date(yesterday.setHours(8, 0, 0, 0)),
      endTime: null,
      status: 'active' as const,
      totalSales: 0,
      salesCount: 0,
    },
  ];

  for (const session of dailySessions) {
    await prisma.dailySessions.create({
      data: session,
    });
  }
  console.log(`✅ Created ${dailySessions.length} daily sessions`);

  // 11. Criar Contatos
  console.log('📇 Creating contacts...');
  const contacts = [
    {
      name: 'Lucas Mendes',
      email: 'lucas.mendes@email.com',
      phone: '(11) 91234-5678',
      company: 'Tech Solutions',
      position: 'CEO',
      contactType: 'lead' as const,
      source: 'Website',
      priority: 'high' as const,
      status: 'active' as const,
      notes: 'Interessado em iPhone 15 Pro Max',
      tags: ['hot-lead', 'iphone'],
      isCustomer: false,
    },
    {
      name: 'Juliana Ferreira',
      email: 'juliana.ferreira@email.com',
      phone: '(11) 92345-6789',
      company: 'Design Studio',
      position: 'Designer',
      contactType: 'prospect' as const,
      source: 'Instagram',
      priority: 'medium' as const,
      status: 'qualified' as const,
      notes: 'Buscando acessórios para iPhone',
      tags: ['prospect', 'accessories'],
      isCustomer: false,
    },
    {
      name: 'Rafael Souza',
      email: 'rafael.souza@email.com',
      phone: '(11) 93456-7890',
      contactType: 'client' as const,
      source: 'Indicação',
      priority: 'low' as const,
      status: 'converted' as const,
      notes: 'Cliente convertido',
      tags: ['client'],
      isCustomer: true,
      customerId: createdCustomers[0].id,
    },
  ];

  const createdContacts = [];
  for (const contact of contacts) {
    const created = await prisma.contacts.create({
      data: contact,
    });
    createdContacts.push(created);
  }
  console.log(`✅ Created ${createdContacts.length} contacts`);

  // 12. Criar Interações de Contatos
  console.log('💬 Creating contact interactions...');
  const contactInteractions = [
    {
      contactId: createdContacts[0].id,
      type: 'call' as const,
      description: 'Ligação inicial - apresentação do produto',
      outcome: 'Interessado, aguardando proposta',
      completedAt: new Date('2024-01-18'),
      duration: 15,
      notes: 'Cliente demonstrou interesse no iPhone 15 Pro Max',
    },
    {
      contactId: createdContacts[0].id,
      type: 'email' as const,
      description: 'Envio de catálogo de produtos',
      outcome: 'Email enviado com sucesso',
      completedAt: new Date('2024-01-18'),
      notes: 'Catálogo completo enviado',
    },
    {
      contactId: createdContacts[1].id,
      type: 'meeting' as const,
      description: 'Reunião presencial na loja',
      outcome: 'Cliente visitou a loja',
      scheduledAt: new Date('2024-01-19'),
      completedAt: new Date('2024-01-19'),
      duration: 30,
      notes: 'Cliente interessado em capas e acessórios',
    },
    {
      contactId: createdContacts[2].id,
      type: 'note' as const,
      description: 'Cliente VIP - histórico de compras',
      notes: 'Cliente frequente, sempre compra produtos premium',
    },
  ];

  for (const interaction of contactInteractions) {
    await prisma.contactInteractions.create({
      data: interaction,
    });
  }
  console.log(`✅ Created ${contactInteractions.length} contact interactions`);

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - ${categories.length} Categories`);
  console.log(`   - ${users.length} Users`);
  console.log(`   - ${products.length} Products`);
  console.log(`   - ${createdCustomers.length} Customers`);
  console.log(`   - ${createdSales.length} Sales`);
  console.log(`   - ${createdServiceOrders.length} Service Orders`);
  console.log(`   - ${serviceOrderCostsCount} Service Order Costs`);
  console.log(`   - ${customerVisits.length} Customer Visits`);
  console.log(`   - ${dailySessions.length} Daily Sessions`);
  console.log(`   - ${createdContacts.length} Contacts`);
  console.log(`   - ${contactInteractions.length} Contact Interactions`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
