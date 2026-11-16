import { PrismaClient, Role, FuelType, PaymentMethod, ExpenseCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du peuplement de la base de données Supabase...');

  // 1. Nettoyage optionnel des anciennes données
  try {
    await prisma.certifiedDocument.deleteMany({});
    await prisma.payrollSlip.deleteMany({});
    await prisma.employeeLoan.deleteMany({});
    await prisma.employeeShortage.deleteMany({});
    await prisma.employee.deleteMany({});
    await prisma.expense.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.subscriberVoucher.deleteMany({});
    await prisma.subscriber.deleteMany({});
    await prisma.stockMovement.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.pumpReading.deleteMany({});
    await prisma.pump.deleteMany({});
    await prisma.tankDipstick.deleteMany({});
    await prisma.tankDelivery.deleteMany({});
    await prisma.tank.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.station.deleteMany({});
    console.log('🧹 Tables nettoyées avec succès.');
  } catch (err) {
    console.log('Note: Pas de données existantes à nettoyer.');
  }

  // 2. Création des stations
  const kissosso = await prisma.station.create({
    data: {
      code: 'KISSOSSO',
      name: 'TotalEnergies Kissosso',
      city: 'Conakry',
    },
  });

  const matoto = await prisma.station.create({
    data: {
      code: 'MATOTO',
      name: 'TotalEnergies Matoto',
      city: 'Conakry',
    },
  });

  const bellevue = await prisma.station.create({
    data: {
      code: 'BELLEVUE',
      name: 'TotalEnergies Belle-Vue',
      city: 'Conakry',
    },
  });

  console.log('✅ 3 Stations créées (Kissosso, Matoto, Belle-Vue).');

  // 3. Création des Utilisateurs
  await prisma.user.createMany({
    data: [
      {
        username: 'superadmin@totalenergies.gn',
        passwordHash: 'admin', // En production, utiliser bcrypt
        fullName: 'ALASSANE CAMARA',
        role: Role.SUPER_ADMIN,
        stationId: null,
      },
      {
        username: 'gerant.kissosso@totalenergies.gn',
        passwordHash: 'admin',
        fullName: 'Sidiki Souaré (Gérant)',
        role: Role.GERANT,
        stationId: kissosso.id,
      },
      {
        username: 'chefpiste.kissosso@totalenergies.gn',
        passwordHash: 'admin',
        fullName: 'Mamadou Baïlo (Chef de Piste)',
        role: Role.CHEF_PISTE,
        stationId: kissosso.id,
      },
      {
        username: 'caissier.kissosso@totalenergies.gn',
        passwordHash: 'admin',
        fullName: 'Aïssatou Camara (Caissière)',
        role: Role.CAISSIER,
        stationId: kissosso.id,
      },
      {
        username: 'gerant.matoto@totalenergies.gn',
        passwordHash: 'admin',
        fullName: 'Ibrahima Sory Touré (Gérant Matoto)',
        role: Role.GERANT,
        stationId: matoto.id,
      },
    ],
  });

  console.log('✅ 5 Utilisateurs créés avec succès.');

  // 4. Création des Cuves pour Kissosso (Initialisées à 0 L)
  const cuveSuper = await prisma.tank.create({
    data: {
      stationId: kissosso.id,
      code: 'CUVE-01',
      fuelType: FuelType.SUPER,
      capacity: 50000,
      initialStock: 0,
      currentStock: 0,
    },
  });

  const cuveGazoil = await prisma.tank.create({
    data: {
      stationId: kissosso.id,
      code: 'CUVE-02',
      fuelType: FuelType.GAZOIL,
      capacity: 60000,
      initialStock: 0,
      currentStock: 0,
    },
  });

  console.log('✅ Cuves créées avec stock initial 0 L.');

  // 5. Création des Pompes pour Kissosso
  const pompe1 = await prisma.pump.create({
    data: {
      stationId: kissosso.id,
      tankId: cuveSuper.id,
      name: 'Pompe 1 - Super',
      fuelType: FuelType.SUPER,
    },
  });

  const pompe2 = await prisma.pump.create({
    data: {
      stationId: kissosso.id,
      tankId: cuveSuper.id,
      name: 'Pompe 2 - Super',
      fuelType: FuelType.SUPER,
    },
  });

  const pompe3 = await prisma.pump.create({
    data: {
      stationId: kissosso.id,
      tankId: cuveGazoil.id,
      name: 'Pompe 3 - Gazoil',
      fuelType: FuelType.GAZOIL,
    },
  });

  const pompe4 = await prisma.pump.create({
    data: {
      stationId: kissosso.id,
      tankId: cuveGazoil.id,
      name: 'Pompe 4 - Gazoil',
      fuelType: FuelType.GAZOIL,
    },
  });

  console.log('✅ 4 Pompes créées (index de départ 0).');

  // 6. Abonnés & Flottes (Soldes vierges à 0 GNF)
  const abonneTopaz = await prisma.subscriber.create({
    data: {
      stationId: kissosso.id,
      code: 'AB-TOPAZ',
      name: 'Topaz Multi-Industries',
      phone: '+224 622 11 22 33',
      address: 'Zone Industrielle Matoto',
      currentAdvance: 0,
      currentCredit: 0,
    },
  });

  const abonneGuicopres = await prisma.subscriber.create({
    data: {
      stationId: kissosso.id,
      code: 'AB-GUICOPRES',
      name: 'Guicopres BTP',
      phone: '+224 624 44 55 66',
      address: 'Kagbelen Conakry',
      currentAdvance: 0,
      currentCredit: 0,
    },
  });

  console.log('✅ Abonnés créés avec soldes à 0 GNF.');

  // 7. Produits Boutique / Lubrifiants & Gaz (Stocks à 0)
  await prisma.product.createMany({
    data: [
      {
        stationId: kissosso.id,
        code: 'RUBIA-7400-5L',
        name: 'Total Quartz / Rubia TIR 7400 15W40 (5L)',
        unitType: 'BIDON',
        currentStock: 0,
        price: 285000,
      },
      {
        stationId: kissosso.id,
        code: 'QUARTZ-9000-5L',
        name: 'Total Quartz 9000 5W40 Synthétique (5L)',
        unitType: 'BIDON',
        currentStock: 0,
        price: 460000,
      },
      {
        stationId: kissosso.id,
        code: 'GAZ-B6',
        name: 'Bouteille de Gaz TotalGaz 6kg (Recharge)',
        unitType: 'UNITE',
        currentStock: 0,
        price: 65000,
      },
      {
        stationId: kissosso.id,
        code: 'GAZ-B12',
        name: 'Bouteille de Gaz TotalGaz 12.5kg (Recharge)',
        unitType: 'UNITE',
        currentStock: 0,
        price: 130000,
      },
    ],
  });

  // 9. Employés & Équipe Station
  await prisma.employee.createMany({
    data: [
      {
        stationId: kissosso.id,
        fullName: 'Aboubacar Camara',
        jobTitle: 'POMPISTE',
        baseSalary: 1800000,
        transportAllowance: 300000,
        livingAllowance: 150000,
        housingAllowance: 200000,
      },
      {
        stationId: kissosso.id,
        fullName: 'Mohamed Lamine Sylla',
        jobTitle: 'POMPISTE',
        baseSalary: 1800000,
        transportAllowance: 300000,
        livingAllowance: 150000,
        housingAllowance: 200000,
      },
      {
        stationId: kissosso.id,
        fullName: 'Kadiatou Bah',
        jobTitle: 'POMPISTE',
        baseSalary: 1800000,
        transportAllowance: 300000,
        livingAllowance: 150000,
        housingAllowance: 200000,
      },
      {
        stationId: kissosso.id,
        fullName: 'Mamadou Baïlo',
        jobTitle: 'CHEF_PISTE',
        baseSalary: 3500000,
        transportAllowance: 500000,
        livingAllowance: 250000,
        housingAllowance: 400000,
      },
      {
        stationId: kissosso.id,
        fullName: 'Aïssatou Camara',
        jobTitle: 'CAISSIER',
        baseSalary: 3200000,
        transportAllowance: 400000,
        livingAllowance: 200000,
        housingAllowance: 350000,
      },
    ],
  });

  console.log('✅ Employés créés.');
  console.log('🎉 Initialisation terminée avec succès dans Supabase !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur de seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
