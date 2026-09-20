import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email et mot de passe requis.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Recherche dans la base Supabase via Prisma
    const dbUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: trimmedEmail,
          mode: 'insensitive',
        },
      },
      include: {
        station: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: 'Identifiant introuvable dans la base de données.' },
        { status: 401 }
      );
    }

    // Vérification du mot de passe
    if (dbUser.passwordHash !== password) {
      return NextResponse.json(
        { success: false, message: 'Mot de passe incorrect.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        name: dbUser.fullName,
        email: dbUser.username,
        role: dbUser.role,
        stationId: dbUser.stationId,
        stationName: dbUser.station ? dbUser.station.name : null,
      },
    });
  } catch (error: any) {
    console.error('Erreur login API:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erreur lors de la vérification des identifiants.',
        error: error.message || error.toString(),
      },
      { status: 500 }
    );
  }
}
