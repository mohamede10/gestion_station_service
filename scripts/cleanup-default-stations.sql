-- ====================================================================
-- NETTOYAGE DES STATIONS PAR DÉFAUT
-- --------------------------------------------------------------------
-- Supprime les 3 stations de démonstration (Kissosso, Matoto, Belle-Vue)
-- ainsi que toutes leurs données liées : cuves, pompes, produits,
-- abonnés, employés, paiements, dépenses, documents certifiés...
--
-- Le compte Super Admin (stationId = NULL) est CONSERVÉ afin de pouvoir
-- se connecter. Aucune autre station n'est supprimée.
--
-- À exécuter dans Supabase > SQL Editor, puis recharger l'application.
-- ====================================================================

BEGIN;

-- 1. Identifier les stations par défaut
CREATE TEMP TABLE default_station_ids ON COMMIT DROP AS
SELECT id
FROM "Station"
WHERE "code" IN ('KISSOSSO', 'MATOTO', 'BELLEVUE', 'stat-kissosso-001', 'stat-matoto-002', 'stat-bellevue-003')
   OR "id" IN ('stat-kissosso-001', 'stat-matoto-002', 'stat-bellevue-003')
   OR "name" IN ('TotalEnergies Kissosso', 'TotalEnergies Matoto', 'TotalEnergies Belle-Vue');

-- 2. Identifier les utilisateurs rattachés à ces stations
CREATE TEMP TABLE default_user_ids ON COMMIT DROP AS
SELECT id
FROM "User"
WHERE "stationId" IN (SELECT id FROM default_station_ids)
  AND "username" <> 'superadmin@totalenergies.gn';

-- 3. Supprimer les écritures comptables saisies par ces utilisateurs
--    (la contrainte User -> Payment/Expense n'est pas en cascade)
DELETE FROM "Payment"
WHERE "recordedById" IN (SELECT id FROM default_user_ids);

DELETE FROM "Expense"
WHERE "recordedById" IN (SELECT id FROM default_user_ids);

-- 4. Détacher les utilisateurs des stations par défaut (contrainte sans cascade)
UPDATE "User"
SET "stationId" = NULL
WHERE "id" IN (SELECT id FROM default_user_ids);

-- 5. Supprimer les comptes utilisateurs par défaut
DELETE FROM "User"
WHERE "id" IN (SELECT id FROM default_user_ids);

-- 6. Supprimer les stations : les tables liées partent en cascade
--    (Tank, Pump, Product, Subscriber, Payment, Expense, Employee,
--     CertifiedDocument, ...)
DELETE FROM "Station"
WHERE "id" IN (SELECT id FROM default_station_ids);

COMMIT;

-- Vérification : il ne doit rester que vos stations créées depuis l'application
SELECT "id", "code", "name", "city", "createdAt"
FROM "Station"
ORDER BY "createdAt" ASC;

-- ====================================================================
-- (OPTIONNEL) Renuméroter les stations restantes au format ST-001, ST-002...
-- Décommenter uniquement si des stations existantes ont d'anciens codes.
-- ====================================================================
-- BEGIN;
-- CREATE TEMP TABLE station_renumber AS
-- SELECT id, row_number() OVER (ORDER BY "createdAt" ASC) AS rn
-- FROM "Station";
-- -- Éviter les collisions avec les codes déjà présents
-- UPDATE "Station" SET "code" = 'TMP-' || "id" WHERE "id" IN (SELECT id FROM station_renumber);
-- UPDATE "Station" s
-- SET "code" = 'ST-' || lpad(r.rn::text, 3, '0')
-- FROM station_renumber r
-- WHERE s.id = r.id;
-- COMMIT;
