import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Récupère toutes les stations avec leurs cuves, pompes et employés
export async function GET() {
  try {
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

// POST: Crée une station complète (avec cuves, pompes, gérant et pompistes)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, name, city, tanks = [], pumps = [], manager, pompistes = [] } = body;

    if (!code || !name || !city) {
      return NextResponse.json(
        { success: false, message: 'Le code, le nom et la ville sont obligatoires.' },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();
    const cleanCity = city.trim();

    // 1. Créer la station
    const station = await prisma.station.create({
      data: {
        code: cleanCode,
        name: cleanName,
        city: cleanCity,
      },
    });

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
        await prisma.pump.create({
          data: {
            stationId: station.id,
            tankId: assignedTankId,
            name: p.name || `Pompe 0${i + 1}`,
            fuelType: p.fuelType === 'GAZOIL' ? 'GAZOIL' : 'SUPER',
          },
        });
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
    for (const emp of pompistes) {
      if (emp.fullName && emp.fullName.trim()) {
        await prisma.employee.create({
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
      }
    }

    return NextResponse.json({
      success: true,
      message: `Station "${station.name}" déployée avec succès.`,
      station,
    });
  } catch (error: any) {
    console.error('Erreur POST /api/stations:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la création de la station', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Supprime une station
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID de la station requis' }, { status: 400 });
    }

    await prisma.station.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Station supprimée avec succès.' });
  } catch (error: any) {
    console.error('Erreur DELETE /api/stations:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la suppression de la station', error: error.message },
      { status: 500 }
    );
  }
}
