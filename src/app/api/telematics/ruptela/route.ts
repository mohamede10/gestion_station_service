import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// In-memory cache des dernières trames reçues pour affichage instantané et débogage
export interface TelematicsFrame {
  id: string;
  imei: string;
  sensorIndex: number;
  sensorBleMac?: string;
  fuelLiters: number;
  temperature?: number;
  batteryPercent?: number;
  rssi?: number;
  status: 'ONLINE' | 'ALERT_THEFT' | 'ALERT_LOW' | 'ALERT_DELIVERY';
  rawPayload?: any;
  receivedAt: string;
}

// Mémoire tampon globale pour persister les derniers pings reçus (utile pour le suivi en direct)
declare global {
  var __LATEST_TELEMATICS_FRAMES: TelematicsFrame[] | undefined;
}

if (!global.__LATEST_TELEMATICS_FRAMES) {
  global.__LATEST_TELEMATICS_FRAMES = [];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const imei = searchParams.get('imei');

  let frames = global.__LATEST_TELEMATICS_FRAMES || [];
  if (imei) {
    frames = frames.filter(f => f.imei === imei);
  }

  return NextResponse.json({
    success: true,
    service: 'Ruptela Smart5 & Eurosens Dominator BT Telematics Gateway',
    version: '1.0.0',
    documentation: {
      endpoint: '/api/telematics/ruptela',
      method: 'POST',
      acceptedFormats: [
        {
          type: 'Standard JSON',
          example: {
            imei: '865421098765432',
            sensorIndex: 1,
            sensorBleMac: 'C3:45:12:89:FE:A1',
            fuelLiters: 28450,
            temperature: 28.5,
            battery: 98,
            rssi: -65
          }
        },
        {
          type: 'Multi-Sensors Ruptela Array',
          example: {
            imei: '865421098765432',
            sensors: [
              { index: 1, liters: 28450, temp: 28.5, battery: 98, mac: 'C3:45:12:89:FE:A1' },
              { index: 2, liters: 34100, temp: 29.0, battery: 95, mac: 'C3:45:12:89:FE:B2' }
            ]
          }
        },
        {
          type: 'Flespi / Traccar Standard Forwarder',
          example: {
            ident: '865421098765432',
            'fuel.level': 28450,
            temperature: 28.5,
            'battery.level': 98
          }
        }
      ]
    },
    recentFramesCount: frames.length,
    recentFrames: frames.slice(0, 20)
  });
}

export async function POST(req: Request) {
  try {
    let body: any = null;
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      const rawText = await req.text();
      try {
        body = JSON.parse(rawText);
      } catch {
        body = { raw: rawText };
      }
    }

    if (!body) {
      return NextResponse.json(
        { success: false, message: 'Corps de requête vide ou invalide' },
        { status: 400 }
      );
    }

    const processedFrames: TelematicsFrame[] = [];
    const timestamp = new Date().toISOString();

    // 1. Détection de l'identifiant IMEI (Ruptela / Flespi / Traccar)
    const imei = String(body.imei || body.ident || body.deviceId || body.trackerId || 'UNKNOWN_IMEI').trim();

    // 2. Traitement d'un tableau multi-sondes
    if (Array.isArray(body.sensors) && body.sensors.length > 0) {
      for (const s of body.sensors) {
        const frame: TelematicsFrame = {
          id: `tf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          imei,
          sensorIndex: Number(s.index || s.sensorIndex || 1),
          sensorBleMac: s.mac || s.sensorBleMac || undefined,
          fuelLiters: Number(s.liters || s.volume || s.fuelLiters || 0),
          temperature: s.temp !== undefined ? Number(s.temp) : (s.temperature !== undefined ? Number(s.temperature) : undefined),
          batteryPercent: s.battery !== undefined ? Number(s.battery) : undefined,
          rssi: s.rssi !== undefined ? Number(s.rssi) : -65,
          status: 'ONLINE',
          rawPayload: s,
          receivedAt: timestamp
        };
        processedFrames.push(frame);
      }
    } else {
      // 3. Traitement mono-sonde ou attributs directs
      const liters = Number(
        body.fuelLiters ?? body.liters ?? body.volume ?? body['fuel.level'] ?? body.can_fuel_level ?? 0
      );
      const temperature = body.temperature ?? body.temp ?? body['can.engine.temperature'];
      const battery = body.battery ?? body.batteryPercent ?? body['battery.level'];
      const rssi = body.rssi ?? body.signal ?? -65;
      const sensorIndex = Number(body.sensorIndex ?? body.index ?? 1);
      const sensorBleMac = body.sensorBleMac || body.mac;

      const frame: TelematicsFrame = {
        id: `tf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        imei,
        sensorIndex,
        sensorBleMac,
        fuelLiters: liters,
        temperature: temperature !== undefined ? Number(temperature) : undefined,
        batteryPercent: battery !== undefined ? Number(battery) : undefined,
        rssi: Number(rssi),
        status: 'ONLINE',
        rawPayload: body,
        receivedAt: timestamp
      };
      processedFrames.push(frame);
    }

    // Sauvegarde dans le buffer en mémoire
    if (global.__LATEST_TELEMATICS_FRAMES) {
      global.__LATEST_TELEMATICS_FRAMES = [
        ...processedFrames,
        ...global.__LATEST_TELEMATICS_FRAMES
      ].slice(0, 100); // Conserve les 100 dernières trames
    }

    return NextResponse.json({
      success: true,
      message: `${processedFrames.length} trame(s) télématique(s) Ruptela reçue(s) et traitée(s)`,
      imei,
      timestamp,
      processed: processedFrames
    });
  } catch (error: any) {
    console.error('Erreur POST /api/telematics/ruptela:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erreur lors du traitement de la trame télématique',
        error: error.message
      },
      { status: 500 }
    );
  }
}
