-- ====================================================================
-- GESTION STATION-SERVICE TOTALENERGIES (PRODUCTION - DÉPART À ZÉRO)
-- STRUCTURE COMPLÈTE SANS MONTANTS FACTICES / PRÊTE POUR SAISIE RÉELLE
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. RÉINITIALISATION PROPRE DES TABLES EXISTANTES
DROP TABLE IF EXISTS "CertifiedDocument" CASCADE;
DROP TABLE IF EXISTS "PayrollSlip" CASCADE;
DROP TABLE IF EXISTS "EmployeeLoan" CASCADE;
DROP TABLE IF EXISTS "EmployeeShortage" CASCADE;
DROP TABLE IF EXISTS "Employee" CASCADE;
DROP TABLE IF EXISTS "Expense" CASCADE;
DROP TABLE IF EXISTS "Invoice" CASCADE;
DROP TABLE IF EXISTS "Payment" CASCADE;
DROP TABLE IF EXISTS "SubscriberVoucher" CASCADE;
DROP TABLE IF EXISTS "Subscriber" CASCADE;
DROP TABLE IF EXISTS "StockMovement" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "PumpReading" CASCADE;
DROP TABLE IF EXISTS "Pump" CASCADE;
DROP TABLE IF EXISTS "TankDipstick" CASCADE;
DROP TABLE IF EXISTS "TankDelivery" CASCADE;
DROP TABLE IF EXISTS "Tank" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Station" CASCADE;

DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "FuelType" CASCADE;
DROP TYPE IF EXISTS "PaymentMethod" CASCADE;
DROP TYPE IF EXISTS "ExpenseCategory" CASCADE;
DROP TYPE IF EXISTS "DocType" CASCADE;

-- 3. TYPES ÉNUMÉRÉS (ENUMS)
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'GERANT', 'CHEF_PISTE', 'CAISSIER');
CREATE TYPE "FuelType" AS ENUM ('SUPER', 'GAZOIL');
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'MOBILE_MONEY', 'CHECK', 'CASH');
CREATE TYPE "ExpenseCategory" AS ENUM ('EDG', 'GROUPE_ELECTROGENE', 'TELEPHONE_INTERNET', 'TRANSPORT', 'ENTRETIEN_REPARATIONS', 'FOURNITURES', 'DIVERS');
CREATE TYPE "DocType" AS ENUM ('PAYMENT_RECEIPT', 'FUEL_VOUCHER', 'CASH_OUT_CERTIFICATE', 'INVOICE', 'PAYSLIP');

-- 4. CRÉATION DES TABLES

-- Stations
CREATE TABLE "Station" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "code" TEXT UNIQUE NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Utilisateurs & Authentification
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "stationId" TEXT REFERENCES "Station"("id") ON DELETE SET NULL,
    "username" TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Cuves de carburant (Stocks initialisés à 0)
CREATE TABLE "Tank" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "stationId" TEXT NOT NULL REFERENCES "Station"("id") ON DELETE CASCADE,
    "code" TEXT NOT NULL,
    "fuelType" "FuelType" NOT NULL,
    "capacity" DOUBLE PRECISION NOT NULL,
    "initialStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Livraisons citernes
CREATE TABLE "TankDelivery" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "tankId" TEXT NOT NULL REFERENCES "Tank"("id") ON DELETE CASCADE,
    "deliveryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "litersReceived" DOUBLE PRECISION NOT NULL,
    "supplierBl" TEXT,
    "costPrice" DOUBLE PRECISION
);

-- Jaugeages physiques
CREATE TABLE "TankDipstick" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "tankId" TEXT NOT NULL REFERENCES "Tank"("id") ON DELETE CASCADE,
    "readingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "theoreticalLiters" DOUBLE PRECISION NOT NULL,
    "physicalLiters" DOUBLE PRECISION NOT NULL,
    "gapLiters" DOUBLE PRECISION NOT NULL,
    "operatorId" TEXT NOT NULL
);

-- Pompes
CREATE TABLE "Pump" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "stationId" TEXT NOT NULL REFERENCES "Station"("id") ON DELETE CASCADE,
    "tankId" TEXT NOT NULL REFERENCES "Tank"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "fuelType" "FuelType" NOT NULL
);

-- Relevés de pompes (VIDE - Prêt pour vos premiers index réels)
CREATE TABLE "PumpReading" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "pumpId" TEXT NOT NULL REFERENCES "Pump"("id") ON DELETE CASCADE,
    "pompisteId" TEXT,
    "startIndex" DOUBLE PRECISION NOT NULL,
    "endIndex" DOUBLE PRECISION NOT NULL,
    "returnToTank" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalLiters" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Produits Boutique, Lubrifiants & Gaz
CREATE TABLE "Product" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "stationId" TEXT NOT NULL REFERENCES "Station"("id") ON DELETE CASCADE,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unitType" TEXT NOT NULL,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Mouvements de stock boutique
CREATE TABLE "StockMovement" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT
);

-- Abonnés & Entreprises Flottes (Avance = 0, Crédit = 0)
CREATE TABLE "Subscriber" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "stationId" TEXT NOT NULL REFERENCES "Station"("id") ON DELETE CASCADE,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "currentAdvance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentCredit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Bons carburant abonnés (VIDE)
CREATE TABLE "SubscriberVoucher" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "subscriberId" TEXT NOT NULL REFERENCES "Subscriber"("id") ON DELETE CASCADE,
    "vehiclePlate" TEXT,
    "fuelType" "FuelType" NOT NULL,
    "liters" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Règlements & Versements (VIDE)
CREATE TABLE "Payment" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "stationId" TEXT NOT NULL REFERENCES "Station"("id") ON DELETE CASCADE,
    "subscriberId" TEXT REFERENCES "Subscriber"("id") ON DELETE SET NULL,
    "payerName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "referenceNo" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "recordedById" TEXT NOT NULL REFERENCES "User"("id"),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Factures (VIDE)
CREATE TABLE "Invoice" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "invoiceNumber" TEXT UNIQUE NOT NULL,
    "subscriberId" TEXT NOT NULL REFERENCES "Subscriber"("id") ON DELETE CASCADE,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "advanceDeducted" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remainingToPay" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Dépenses Caisse (VIDE)
CREATE TABLE "Expense" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "stationId" TEXT NOT NULL REFERENCES "Station"("id") ON DELETE CASCADE,
    "category" "ExpenseCategory" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "beneficiary" TEXT NOT NULL,
    "justificationUrl" TEXT,
    "notes" TEXT,
    "recordedById" TEXT NOT NULL REFERENCES "User"("id"),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Personnel & Employés
CREATE TABLE "Employee" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "stationId" TEXT NOT NULL REFERENCES "Station"("id") ON DELETE CASCADE,
    "fullName" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "baseSalary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transportAllowance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "livingAllowance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "housingAllowance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Manquants pompistes (VIDE)
CREATE TABLE "EmployeeShortage" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "employeeId" TEXT NOT NULL REFERENCES "Employee"("id") ON DELETE CASCADE,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "monthPeriod" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT FALSE
);

-- Prêts & Avances sur salaire (VIDE)
CREATE TABLE "EmployeeLoan" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "employeeId" TEXT NOT NULL REFERENCES "Employee"("id") ON DELETE CASCADE,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT
);

-- Bulletins de paie (VIDE)
CREATE TABLE "PayrollSlip" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "employeeId" TEXT NOT NULL REFERENCES "Employee"("id") ON DELETE CASCADE,
    "monthPeriod" TEXT NOT NULL,
    "baseSalary" DOUBLE PRECISION NOT NULL,
    "totalAllowances" DOUBLE PRECISION NOT NULL,
    "grossSalary" DOUBLE PRECISION NOT NULL,
    "previousLoans" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthLoans" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shortagesDeducted" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reimbursements" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netPayable" DOUBLE PRECISION NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Documents certifiés QR (VIDE)
CREATE TABLE "CertifiedDocument" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "docNumber" TEXT UNIQUE NOT NULL,
    "stationId" TEXT NOT NULL REFERENCES "Station"("id") ON DELETE CASCADE,
    "docType" "DocType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operatorName" TEXT NOT NULL,
    "contentJson" TEXT NOT NULL,
    "qrHash" TEXT NOT NULL
);

-- ====================================================================
-- 5. INITIALISATION DES ACCÈS ET DE LA STRUCTURE DE DÉPART (0 GNF / 0 LITRE)
-- ====================================================================

-- 5.1 Stations Réseau
INSERT INTO "Station" ("id", "code", "name", "city") VALUES
('stat-kissosso-001', 'KISSOSSO', 'TotalEnergies Kissosso', 'Conakry'),
('stat-matoto-002', 'MATOTO', 'TotalEnergies Matoto', 'Conakry'),
('stat-bellevue-003', 'BELLEVUE', 'TotalEnergies Belle-Vue', 'Conakry');

-- 5.2 Comptes d'accès Utilisateurs (Mot de passe par défaut : admin)
INSERT INTO "User" ("id", "stationId", "username", "passwordHash", "fullName", "role") VALUES
('usr-superadmin', NULL, 'superadmin@totalenergies.gn', 'admin', 'M. CAMARA (Directeur Général)', 'SUPER_ADMIN'),
('usr-gerant-kissosso', 'stat-kissosso-001', 'gerant.kissosso@totalenergies.gn', 'admin', 'Sidiki Souaré (Gérant)', 'GERANT'),
('usr-chefpiste-kissosso', 'stat-kissosso-001', 'chefpiste.kissosso@totalenergies.gn', 'admin', 'Mamadou Baïlo (Chef de Piste)', 'CHEF_PISTE'),
('usr-caissier-kissosso', 'stat-kissosso-001', 'caissier.kissosso@totalenergies.gn', 'admin', 'Aïssatou Camara (Caissière)', 'CAISSIER'),
('usr-gerant-matoto', 'stat-matoto-002', 'gerant.matoto@totalenergies.gn', 'admin', 'Ibrahima Sory Touré (Gérant Matoto)', 'GERANT');

-- 5.3 Cuves de carburant Kissosso (Capacité configurée, Stock initial = 0 L)
INSERT INTO "Tank" ("id", "stationId", "code", "fuelType", "capacity", "initialStock", "currentStock") VALUES
('tank-super-01', 'stat-kissosso-001', 'CUVE-01', 'SUPER', 50000, 0, 0),
('tank-gazoil-02', 'stat-kissosso-001', 'CUVE-02', 'GAZOIL', 60000, 0, 0);

-- 5.4 Pompes distributrices Kissosso (Prêtes pour la saisie des index de départ)
INSERT INTO "Pump" ("id", "stationId", "tankId", "name", "fuelType") VALUES
('pump-01', 'stat-kissosso-001', 'tank-super-01', 'Pompe 1 - Essence', 'SUPER'),
('pump-02', 'stat-kissosso-001', 'tank-super-01', 'Pompe 2 - Essence', 'SUPER'),
('pump-03', 'stat-kissosso-001', 'tank-gazoil-02', 'Pompe 3 - Gazoil', 'GAZOIL'),
('pump-04', 'stat-kissosso-001', 'tank-gazoil-02', 'Pompe 4 - Gazoil', 'GAZOIL');

-- 5.5 Références Produits Boutique & Lubrifiants (Stocks initiaux = 0)
INSERT INTO "Product" ("id", "stationId", "code", "name", "unitType", "currentStock", "price") VALUES
('prod-01', 'stat-kissosso-001', 'RUBIA-7400-5L', 'Total Quartz / Rubia TIR 7400 15W40 (5L)', 'BIDON', 0, 285000),
('prod-02', 'stat-kissosso-001', 'QUARTZ-9000-5L', 'Total Quartz 9000 5W40 Synthétique (5L)', 'BIDON', 0, 460000),
('prod-03', 'stat-kissosso-001', 'GAZ-B6', 'Bouteille de Gaz TotalGaz 6kg (Recharge)', 'UNITE', 0, 65000),
('prod-04', 'stat-kissosso-001', 'GAZ-B12', 'Bouteille de Gaz TotalGaz 12.5kg (Recharge)', 'UNITE', 0, 130000);

-- ====================================================================
-- FIN DU SCRIPT : LA BASE DE DONNÉES EST TOTALEMENT VIERGE DE TRANSACTIONS !
-- TOUTES LES TABLES FINANCIÈRES, RELEVÉS ET DÉPENSES SONT À ZÉRO.
-- ====================================================================
