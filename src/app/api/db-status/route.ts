import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const stationCount = await prisma.station.count();
    const userCount = await prisma.user.count();
    const tankCount = await prisma.tank.count();
    const subscriberCount = await prisma.subscriber.count();

    return NextResponse.json({
      status: 'connected',
      message: 'Connexion à la base de données Supabase réussie !',
      counts: {
        stations: stationCount,
        users: userCount,
        tanks: tankCount,
        subscribers: subscriberCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Impossible de se connecter à la base de données.',
        error: error.message || error.toString(),
      },
      { status: 500 }
    );
  }
}
