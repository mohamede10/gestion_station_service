-- ====================================================================
-- MIGRATION INCRÉMENTALE — PISTOLETS, BASCULE DES CUVES, PRIME SALAIRE
-- À exécuter sur une base existante déjà initialisée avec supabase_setup.sql.
-- Aucune donnée n'est supprimée.
-- ====================================================================

-- 1. Le type ESSENCE est désormais explicite (SUPER reste compatibilité).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'FuelType' AND e.enumlabel = 'ESSENCE'
  ) THEN
    ALTER TYPE "FuelType" ADD VALUE 'ESSENCE';
  END IF;
END $$;

-- 2. Cuves : vanne, groupe de bascule et pommes/pistolets desservis.
ALTER TABLE "Tank"
  ADD COLUMN IF NOT EXISTS "valveStatus" TEXT NOT NULL DEFAULT 'OPEN',
  ADD COLUMN IF NOT EXISTS "basculeGroup" TEXT NOT NULL DEFAULT 'ESSENCE',
  ADD COLUMN IF NOT EXISTS "suppliesPumpIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- 3. Pompes : deux pistolets avec index, cuve, carburant et prix indépendants.
ALTER TABLE "Pump"
  ADD COLUMN IF NOT EXISTS "pistolet1FuelType" "FuelType" NOT NULL DEFAULT 'SUPER',
  ADD COLUMN IF NOT EXISTS "pistolet1TankId" TEXT,
  ADD COLUMN IF NOT EXISTS "pistolet1StartIndex" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "pistolet1EndIndex" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "pistolet1ReturnToTank" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "pistolet1UnitPrice" DOUBLE PRECISION NOT NULL DEFAULT 12000,
  ADD COLUMN IF NOT EXISTS "pistolet2FuelType" "FuelType" NOT NULL DEFAULT 'GAZOIL',
  ADD COLUMN IF NOT EXISTS "pistolet2TankId" TEXT,
  ADD COLUMN IF NOT EXISTS "pistolet2StartIndex" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "pistolet2EndIndex" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "pistolet2ReturnToTank" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "pistolet2UnitPrice" DOUBLE PRECISION NOT NULL DEFAULT 12000;

-- Les anciennes pompes héritent de leur cuve historique sur le pistolet 1.
UPDATE "Pump"
SET "pistolet1TankId" = "tankId",
    "pistolet1FuelType" = CASE WHEN "fuelType" = 'GAZOIL' THEN 'GAZOIL' ELSE 'SUPER' END
WHERE "pistolet1TankId" IS NULL;

-- 4. Abonnés : volume de crédit saisi à la création.
ALTER TABLE "Subscriber"
  ADD COLUMN IF NOT EXISTS "creditLiters" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- 5. Personnel et bulletins : prime saisie dès la création.
ALTER TABLE "Employee"
  ADD COLUMN IF NOT EXISTS "prime" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "primeLabel" TEXT;

ALTER TABLE "PayrollSlip"
  ADD COLUMN IF NOT EXISTS "prime" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "primeLabel" TEXT;

-- 6. Une seule vanne ouverte par groupe et par station (données existantes).
UPDATE "Tank" t
SET "valveStatus" = 'CLOSED'
WHERE t."valveStatus" = 'OPEN'
  AND EXISTS (
    SELECT 1 FROM "Tank" other
    WHERE other."stationId" = t."stationId"
      AND other."basculeGroup" = t."basculeGroup"
      AND other."valveStatus" = 'OPEN'
      AND other."createdAt" < t."createdAt"
  );

-- ====================================================================
-- FIN DE MIGRATION
-- ====================================================================
