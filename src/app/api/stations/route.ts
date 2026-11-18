import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Codes/identifiants des anciennes stations de démonstration.
const LEGACY_STATION_CODES = ['KISSOSSO', 'MATOTO', 'BELLEVUE'];
const LEGACY_STATION_IDS = ['stat-kissosso-001', 'stat-matoto-002', 'stat-bellevue-003'];

let legacyCleanupDone = false;

// Supprime une seule fois par processus les stations de démonstration
// éventuellement encore présentes en base (le Super Admin est conservé).
async function cleanupLegacyStations() {
  if (legacyCleanupDone) return;
  try {
    const legacy = await prisma.station.findMany({
      where: {
        OR: [
          { code: { in: LEGACY_STATION_CODES } },
          { id: { in: LEGACY_STATION_IDS } },
        ],
      },
      select: { id: true },
    });
    if (legacy.length > 0) {
      await purgeStations(legacy.map((s) => s.id));
    }
    legacyCleanupDone = true;
  } catch (error) {
    // On réessaiera à la prochaine requête (base momentanément indisponible)
    console.warn('Nettoyage des stations par défaut reporté:', error);
  }
}

// GET: Récupère toutes les stations avec leurs cuves, pompes et employés
export async function GET() {
  try {
    await cleanupLegacyStations();

    const stations = await prisma.station.findMany({
      include: {
        tanks: true,
        pumps: true,
        employees: true,
        users: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, stations });
  } catch (error: any) {
    console.error('Erreur GET /api/stations:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des stations', error: error.message },
      { status: 500 }
    );
  }
}

// Génère le prochain code station au format ST-001, ST-002, ST-003, ...
async function generateNextStationCode(): Promise<string> {
  const existing = await prisma.station.findMany({ select: { code: true } });
  let maxNumber = 0;
  for (const station of existing) {
    const match = /^ST-(\d+)$/i.exec((station.code || '').trim());
    if (match) maxNumber = Math.max(maxNumber, Number(match[1]));
  }
  return `ST-${String(maxNumber + 1).padStart(3, '0')}`;
}

// POST: Crée une station complète (avec cuves, pompes, gérant et pompistes)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, city, tanks = [], pumps = [], manager, pompistes = [] } = body;

    if (!name || !city) {
      return NextResponse.json(
        { success: false, message: 'Le nom et la ville sont obligatoires.' },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanCity = city.trim();

    // 1. Créer la station avec un code séquentiel généré côté serveur
    let station = null;
    let lastCodeError: any = null;
    for (let attempt = 0; attempt < 5 && !station; attempt++) {
      const code = await generateNextStationCode();
      try {
        station = await prisma.station.create({
          data: { code, name: cleanName, city: cleanCity },
        });
      } catch (err: any) {
        // Collision de code (créations simultanées) : on recalcule et on réessaie
        if (err?.code === 'P2002') {
          lastCodeError = err;
          continue;
        }
        throw err;
      }
    }

    if (!station) {
      return NextResponse.json(
        { success: false, message: 'Impossible de générer un code station unique.', error: lastCodeError?.message },
        { status: 409 }
      );
    }

    // 2. Créer les cuves
    const createdTanks: any[] = [];
    for (let i = 0; i < tanks.length; i++) {
      const t = tanks[i];
      const tank = await prisma.tank.create({
        data: {
          stationId: station.id,
          code: t.code || `CUVE 0${i + 1} - ${t.fuelType}`,
          fuelType: t.fuelType === 'GAZOIL' ? 'GAZOIL' : 'SUPER',
          capacity: Number(t.capacity) || 45000,
          initialStock: Number(t.initialStock) || 0,
          currentStock: Number(t.initialStock) || 0,
        },
      });
      createdTanks.push(tank);
    }

    // 3. Créer les pompes
    const createdPumps: any[] = [];
    for (let i = 0; i < pumps.length; i++) {
      const p = pumps[i];
      let assignedTankId = createdTanks[0]?.id;
      if (p.tankIndex !== undefined && createdTanks[p.tankIndex]) {
        assignedTankId = createdTanks[p.tankIndex].id;
      } else if (p.fuelType) {
        const match = createdTanks.find((tk) => tk.fuelType === p.fuelType);
        if (match) assignedTankId = match.id;
      }

      if (assignedTankId) {
        const pump = await prisma.pump.create({
          data: {
            stationId: station.id,
            tankId: assignedTankId,
            name: p.name || `Pompe 0${i + 1}`,
            fuelType: p.fuelType === 'GAZOIL' ? 'GAZOIL' : 'SUPER',
          },
        });
        createdPumps.push(pump);
      }
    }

    // 4. Créer le compte Gérant si renseigné
    if (manager && manager.email && manager.fullName) {
      const managerUsername = manager.email.trim().toLowerCase();
      const existing = await prisma.user.findUnique({ where: { username: managerUsername } });
      if (!existing) {
        await prisma.user.create({
          data: {
            stationId: station.id,
            username: managerUsername,
            fullName: manager.fullName.trim(),
            passwordHash: manager.password || 'admin',
            role: 'GERANT',
          },
        });
      }
    }

    // 5. Créer les pompistes s'ils sont renseignés
    const createdEmployees: any[] = [];
    for (const emp of pompistes) {
      if (emp.fullName && emp.fullName.trim()) {
        const employee = await prisma.employee.create({
          data: {
            stationId: station.id,
            fullName: emp.fullName.trim(),
            jobTitle: 'Pompiste',
            baseSalary: Number(emp.baseSalary) || 1500000,
            transportAllowance: 150000,
            livingAllowance: 150000,
            housingAllowance: 200000,
            status: 'ACTIVE',
          },
        });
        createdEmployees.push(employee);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Station "${station.name}" déployée avec succès.`,
      station,
      tanks: createdTanks,
      pumps: createdPumps,
      employees: createdEmployees,
    });
  } catch (error: any) {
    console.error('Erreur POST /api/stations:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la création de la station', error: error.message },
      { status: 500 }
    );
  }
}

// Supprime des stations et leurs dépendances.
// La relation User -> Station n'étant pas en cascade, on supprime d'abord
// les utilisateurs rattachés (sauf le Super Admin) et leurs écritures.
async function purgeStations(stationIds: string[]) {
  if (stationIds.length === 0) return;

  const users = await prisma.user.findMany({
    where: {
      stationId: { in: stationIds },
      username: { not: 'superadmin@totalenergies.gn' },
    },
    select: { id: true },
  });
  const userIds = users.map((u) => u.id);

  if (userIds.length > 0) {
    await prisma.payment.deleteMany({ where: { recordedById: { in: userIds } } });
    await prisma.expense.deleteMany({ where: { recordedById: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  }

  // Les autres tables liées (cuves, pompes, produits, abonnés, employés...)
  // sont supprimées automatiquement par les contraintes ON DELETE CASCADE.
  await prisma.station.deleteMany({ where: { id: { in: stationIds } } });
}

// DELETE: Supprime une station ou toutes les stations
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all');

    if (all === 'true') {
      const stations = await prisma.station.findMany({ select: { id: true } });
      await purgeStations(stations.map((s) => s.id));
      return NextResponse.json({ success: true, message: 'Toutes les stations ont été supprimées avec succès.' });
    }

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID de la station requis' }, { status: 400 });
    }

    const station = await prisma.station.findUnique({ where: { id }, select: { id: true } });
    if (!station) {
      return NextResponse.json({ success: false, message: 'Station introuvable.' }, { status: 404 });
    }

    await purgeStations([station.id]);

    return NextResponse.json({ success: true, message: 'Station supprimée avec succès.' });
  } catch (error: any) {
    console.error('Erreur DELETE /api/stations:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la suppression de la station', error: error.message },
      { status: 500 }
    );
  }
}
