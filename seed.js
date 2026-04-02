const { sequelize, testConnection } = require('./database');
const { User, Property, Tenant, Payment } = require('./models');

const seedDatabase = async () => {
  try {
    const dbReady = await testConnection();

    if (!dbReady) {
      console.log('⚠️ PostgreSQL n’est pas disponible. Installez et démarrez PostgreSQL avant le seed.');
      process.exit(1);
    }

    await sequelize.sync({ force: true });

    const admin = await User.create({
      email: 'admin@olery.com',
      password: 'admin123',
      firstName: 'Ndiba',
      lastName: 'Gabou',
      phone: '+221 77 000 0000',
      company: 'o´lery Immobilier',
      role: 'admin',
      isActive: true,
    });

    console.log('✅ Utilisateur admin créé: admin@olery.com / admin123');

    const properties = await Property.bulkCreate([
      {
        userId: admin.id,
        name: 'Appartement A3',
        type: 'appartement',
        address: '12 Rue du Plateau',
        city: 'Dakar',
        surface: 75,
        monthlyRent: 180000,
        deposit: 180000,
        status: 'occupied',
      },
      {
        userId: admin.id,
        name: 'Studio B1',
        type: 'studio',
        address: '45 Allée des Almadies',
        city: 'Dakar',
        surface: 32,
        monthlyRent: 95000,
        deposit: 95000,
        status: 'occupied',
      },
      {
        userId: admin.id,
        name: 'Villa V2',
        type: 'villa',
        address: '8 Avenue Fann Résidence',
        city: 'Dakar',
        surface: 200,
        monthlyRent: 350000,
        deposit: 350000,
        status: 'available',
      },
    ]);

    const tenants = await Tenant.bulkCreate([
      {
        userId: admin.id,
        propertyId: properties[0].id,
        firstName: 'Fatou',
        lastName: 'Diallo',
        email: 'f.diallo@email.com',
        phone: '+221 77 123 4567',
        leaseStart: '2024-01-01',
        leaseEnd: '2025-12-31',
        monthlyRent: 180000,
        status: 'active',
      },
      {
        userId: admin.id,
        propertyId: properties[1].id,
        firstName: 'Mamadou',
        lastName: 'Sow',
        email: 'm.sow@email.com',
        phone: '+221 76 234 5678',
        leaseStart: '2024-03-01',
        leaseEnd: '2025-02-28',
        monthlyRent: 95000,
        status: 'active',
      },
    ]);

    const currentMonth = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

    await Payment.bulkCreate([
      {
        userId: admin.id,
        tenantId: tenants[0].id,
        propertyId: properties[0].id,
        amount: 180000,
        month: currentMonth,
        paymentDate: new Date(),
        dueDate: new Date().toISOString().split('T')[0],
        method: 'virement',
        reference: 'PAY-001',
        status: 'paid',
      },
      {
        userId: admin.id,
        tenantId: tenants[1].id,
        propertyId: properties[1].id,
        amount: 95000,
        month: currentMonth,
        paymentDate: new Date(),
        dueDate: new Date().toISOString().split('T')[0],
        method: 'mobile_money',
        reference: 'PAY-002',
        status: 'paid',
      },
      {
        userId: admin.id,
        tenantId: tenants[1].id,
        propertyId: properties[1].id,
        amount: 95000,
        month: currentMonth,
        paymentDate: null,
        dueDate: new Date().toISOString().split('T')[0],
        method: 'virement',
        reference: 'PAY-003',
        status: 'pending',
      },
    ]);

    console.log('✅ Données de démonstration créées avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur pendant le seed:', error);
    process.exit(1);
  }
};

seedDatabase();
