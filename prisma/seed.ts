import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed minimaliste.
 *
 * Aucune station, cuve, pompe, produit, abonné ou employé n'est créé par défaut.
 * Les stations sont uniquement créées depuis l'application avec un code
 * automatique au format ST-001, ST-002, ST-003, ...
 *
 * Seul le compte Super Admin est garanti pour permettre la première connexion.
 * Le script est idempotent : il ne supprime aucune donnée existante.
 */
async function main() {
  console.log('🌱 Initialisation minimale (Super Admin uniquement)...');

  await prisma.user.upsert({
    where: { username: 'superadmin@totalenergies.gn' },
    update: {},
    create: {
      username: 'superadmin@totalenergies.gn',
      passwordHash: 'admin',
      fullName: 'M. CAMARA (Directeur Général)',
      role: Role.SUPER_ADMIN,
      stationId: null,
    },
  });

  console.log('✅ Compte Super Admin disponible (superadmin@totalenergies.gn / admin).');
  console.log('ℹ️  Aucune station par défaut : créez vos stations depuis l\'application.');
}

main()
  .catch((e) => {
    console.error('❌ Erreur de seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
