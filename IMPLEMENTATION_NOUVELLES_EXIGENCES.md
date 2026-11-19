# Implémentation des nouvelles exigences — Station TotalEnergies

Ce document décrit la conception et le plan d’implémentation des cinq exigences supplémentaires.

## 1. Pompes à deux pistolets avec index indépendants

### Modèle
- `PumpMock` reste l’entité « Pompe » et porte deux pistolets :
  - `pistolet1`: `{ fuelType, tankId, startIndex, endIndex, returnToTank, unitPrice }`
  - `pistolet2`: identique, avec un carburant et une cuve éventuellement différents.
- Les champs historiques `fuelType`, `tankId`, `startIndex`, `endIndex`, `returnToTank`, `unitPrice` restent pour compatibilité et reflètent le pistolet 1.
- `Pump` Prisma/Sql : ajout des colonnes `pistolet1FuelType`, `pistolet1TankId`, `pistolet1StartIndex`, `pistolet1EndIndex`, `pistolet1ReturnToTank`, `pistolet1UnitPrice` et équivalentes pour `pistolet2`.

### UI
- Wizard station (étape 3) : chaque pompe dispose de deux blocs pistolet :
  - carburant (Essence/Gazoil),
  - cuve d’alimentation (parmi les cuves du même carburant),
  - prix unitaire,
  - index départ/arrivée et retour cuve saisis en tournée.
- `/carburants` : la tournée sélectionne la pompe **et le pistolet** ; l’index et le prix affichés sont ceux du pistolet choisi.
- Cartes pompes : affichage des deux pistolets et de leurs index.

## 2. Abonnés identifiés ou créés pendant la tournée

- `recordPumpShift` accepte :
  - `subscriberMode: 'NONE' | 'EXISTING' | 'NEW'`,
  - `subscriberId?`,
  - `newSubscriber?: { name, phone, address, initialAdvance, creditLiters }`.
- Pour `EXISTING`, le montant de la vente est ajouté à `currentCredit` de l’abonné sélectionné.
- Pour `NEW`, un abonné est créé puis crédité du montant calculé automatiquement.
- Le reçu de tournée indique l’abonné, le mode (existant/nouveau) et le montant porté au crédit.
- UI `/carburants` : sélection « Abonné (crédit tournée) » avec recherche/choix d’un abonné existant ou création rapide.

## 3. Création abonné : avance initiale + litres crédit → montant automatique

- Formulaire « Nouvel Abonné » (`/abonnes` et console admin `/stations`) :
  - `initialAdvance`,
  - `creditLiters`,
  - `unitPrice` (par défaut 12 000 GNF/L),
  - montant calculé automatiquement : `creditLiters × unitPrice`, affiché en lecture seule.
- `addSubscriber` accepte `initialCredit` et stocke le montant calculé.
- Le reçu/l’historique précise avance initiale, litres crédités et montant correspondant.

## 4. Bascule des cuves (vannes) vers les pompes/pistolets

### Modèle
- `TankMock` : `valveStatus: 'OPEN' | 'CLOSED'`, `suppliesPumpIds: string[]`, `linkedNozzleKeys: string[]`, `basculeGroup?: string`, `isActiveSupply?: boolean`.
- Prisma/SQL : colonnes équivalentes sur `Tank` (`valveStatus`, `basculeGroup`, `suppliesPumpIds`) pour représenter le « point de rencontre » qui alimente toutes les pompes du groupe.
- Règle fonctionnelle : plusieurs cuves du même carburant peuvent être raccordées au même groupe de distribution ; lorsqu’une cuve est épuisée, le technicien ferme sa vanne et ouvre celle de la cuve suivante. Les pistolets restent liés au groupe, pas à une seule cuve.

### UI
- `/carburants` : nouveau bloc « Bascule des cuves / Vannes » :
  - liste des cuves par carburant,
  - statut de vanne (OUVERTE/FERMÉE),
  - bouton « Ouvrir cette cuve / Basculer » qui ferme les autres cuves du même groupe et rend active la cuve choisie,
  - sélection des pompes/pistolets desservis.
- Les déductions de tournée utilisent la cuve active du groupe du pistolet (pas forcément la cuve statique du pistolet).

## 5. Prime et salaire saisis à la création des pompistes

- `addEmployee` accepte `prime` et `primeLabel` dès la création et calcule `netSalary` en les incluant.
- Wizard station (étape 4) : chaque pompiste a un champ `baseSalary` **et** un champ `prime` (+ libellé).
- Admin `/stations` et `/rh-salaires` : mêmes champs à la création.
- Suppression du parcours « Accorder une Prime » a posteriori dans `/rh-salaires` : la prime n’est plus ajoutée directement ; la bulletin utilise la prime enregistrée à la création.
- `generateEmployeePayslip` n’accepte plus de `overridePrime` : il lit `emp.prime` / `emp.primeLabel`.

## Persistance
- Prisma `schema.prisma`, `supabase_setup.sql` et `/api/stations` mis à jour.
- `scripts/migration_pistolets_bascule.sql` permet une montée de version sans écraser les données existantes.
- `StationContext` (localStorage + API) étendu sans casser les données existantes (valeurs par défaut).

## Vérification
- `npx tsc --noEmit` puis `npm run build`.
- Vérification manuelle des parcours via l’application locale.
