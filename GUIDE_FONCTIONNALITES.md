# Guide de Fonctionnement — Application TotalEnergies Station Manager V2

L'application a été entièrement développée et configurée pour répondre à toutes les exigences opérationnelles avant la connexion finale de la base de données PostgreSQL de production.

---

## 🚀 Accès à l'Application

- **URL Locale :** `http://localhost:3010`
- **État du Serveur :** En ligne & fonctionnel
- **Vérification Build :** `npm run build` validé avec succès (10 pages générées, 0 erreur TypeScript)
- **Stockage de transition :** Synchronisation temps réel avec persistance locale (`localStorage`), réinitialisable à tout moment via le bouton en haut à droite de la barre de navigation.

---

## 📋 Récapitulatif des Modules & Fonctionnalités Implémentées

### 1. ⛽ Gestion Carburants, Cuves, Index & Pertes (`/carburants`)
- **Stock Départ & Restant :** Suivi en temps réel des cuves (Super et Gazoil) avec jaugeage de niveau visuel et pourcentage de remplissage.
- **Stock Entrant (Réceptions Citernes) :**
  - Saisie des dépotages avec N° de Bon de Livraison (BL), immatriculation du camion citerne, nom du chauffeur livreur, fournisseur/dépôt (ex: Coronthie) et volume livré en litres.
  - Augmentation automatique et traçable du stock en cuve.
- **Stock Sortant (Tournées Pompes) :**
  - Saisie par quart (Matin, Soir, Nuit) des index de départ, index d'arrivée, retour en cuve (essais/purges) et pompiste responsable.
  - Calcul automatique des litres nets vendus et de la recette totale à recouvrer au prix réglementé (12 000 GNF/L).
  - Déduction automatique sur le stock de la cuve correspondante.
- **Contrôle des Écarts & Détection de Coulage (Jaugeage Physique) :**
  - Saisie du niveau mesuré à la règle graduée.
  - Calcul de l'écart : `Stock Physique - Stock Théorique`.
  - Détection immédiate du coulage avec alerte rouge et estimation financière de la perte en GNF.
- **Certification & Documents :**
  - Édition immédiate du **Bon de Tournée Pompiste Certifié**.
  - Édition du **Certificat de Jaugeage & Détection d'Écart**.
  - Édition du **Certificat de Réception & Dépotage Citerne**.

---

### 2. 👥 Abonnés, Flottes, Crédits & Factures (`/abonnes`)
- **Fiches Abonnés :**
  - Répertoire complet des entreprises et clients abonnés avec coordonnées, téléphone et adresse.
  - Suivi en temps réel : **Acomptes (avances versées)**, **Crédits (consommations cumulées)** et **Reste net à payer**.
- **Saisie Obligatoire des Versements :**
  - **Nom du Déposant / Payeur** (Obligatoire).
  - **Numéro de Compte bancaire / RIB / Mobile Money** (Obligatoire).
  - Mode de paiement (Virement Bancaire, Chèque, Mobile Money, Espèces en caisse).
  - Référence de transaction / N° chèque et motif.
  - Déduction automatique du crédit client ou alimentation de son compte avance.
- **Bons de Carburant à Crédit :**
  - Enregistrement des prises de carburant par bon avec immatriculation du véhicule, nom du chauffeur, carburant et litrage servi.
- **Facturation Officielle TotalEnergies :**
  - Bouton **"Facture PDF"** générant le document certifié officiel avec logo TotalEnergies, date/heure certifiée, détail des débits/crédits et montant net restant dû à régler.

---

### 3. 💰 Caisse, Dépenses Ventilées & Versements Bancaires (`/caisse`)
- **Grand Livre de Trésorerie :**
  - Total des Entrées de caisse (recettes pompes + paiements abonnés).
  - Total des Sorties d'exploitation.
  - Solde net physique sous coffre calculé automatiquement.
- **Dépenses d'Exploitation Ventilées :**
  - ⚡ **EDG** (Factures Électricité de Guinée).
  - ⛽ **Groupe Électrogène** (Carburant secours et maintenance).
  - 📞 **Téléphone & Internet** de la station.
  - 🚌 **Transport & Coursiers**.
  - 🔧 **Entretien, Réparations & Maintenance** des pistes et tuyauteries.
  - 📦 **Fournitures** de bureau et rouleaux de papier pour tickets de caisse.
  - 📝 **Divers**.
- **Versement Bancaire des Recettes de la Station :**
  - Formulaire dédié pour enregistrer les transferts de fonds vers la banque officielle de la station avec nom du convoyeur/gérant, banque réceptrice et numéro de compte.
- **Certification :**
  - Édition du **Bon de Décaissement Certifié** et du **Bordereau de Versement Bancaire**.

---

### 4. 👤 Ressources Humaines & Bulletins de Paie (`/rh-salaires`)
- **Registre du Personnel :**
  - Fiches complètes : Pompistes, Chefs de piste, Gérants, Gardiens de nuit, Caissiers.
  - Grille salariale : Salaire de base, prime de transport, prime de panier/vie chère, indemnité de logement.
- **Gestion des Manquants & Prêts :**
  - Imputation des manquants pompistes constatés lors des clôtures de quarts.
  - Gestion des avances et prêts sur salaire.
  - Déduction automatique sur le salaire net en fin de mois.
- **Édition du Bulletin de Paie Officiel TotalEnergies :**
  - Document certifié avec détail du brut, des déductions pour manquants, des prêts et du net à payer comptant.

---

### 5. 🛢️ Lubrifiants, Gaz & Boutique (`/lubrifiants`)
- Catalogue des huiles TotalEnergies (Quartz 9000, Quartz 7000, Rubia S50, fûts) et bouteilles de gaz (6kg, 12kg).
- Ventes flash directes avec déduction en direct du stock boutique.
- Module de réapprovisionnement (entrées de stock).
- Ajout de nouveaux produits au catalogue.
- Calcul de la valeur financière marchande du stock.

---

### 6. 🏢 Console Multi-Stations & Rôles (`/stations`)
- **Cloisonnement Étanche & Super-Admin :**
  - Le Super-Admin dispose d'une vue consolidée sur l'ensemble du réseau national.
  - Chaque gérant local a accès uniquement aux données de sa propre station.
- **Déploiement de Nouvelles Stations :**
  - Création instantanée d'une station dans n'importe quelle ville (ex: Labé, Kindia, Mamou, Kankan, Nzérékoré...).
  - Initialisation automatique des cuves (Super, Gazoil) et des pompes associées.
- **Bascule Instantanée :**
  - Sélecteur direct dans la barre de navigation supérieure pour passer d'une station à l'autre ou revenir à la vue consolidée.

---

## 🗄️ Connexion à la Vraie Base PostgreSQL pour la Prod

Quand vous serez prêt à brancher votre serveur PostgreSQL :

1. Ouvrez le fichier [.env](file:///c:/xampp/htdocs/projets/gestion_station_totalenergies_kissosso/.env) et indiquez vos identifiants :
   ```env
   DATABASE_URL="postgresql://utilisateur:motdepasse@localhost:5432/station_totalenergies?schema=public"
   ```
2. Appliquez les tables en base de données :
   ```bash
   npx prisma migrate dev --name init_totalenergies
   ```
3. L'ensemble des modèles et des relations dans `prisma/schema.prisma` est déjà préconfiguré pour correspondre exactement aux données de l'application.


superadmin@totalenergies.gn    →  👑 Super Admin (toutes stations)
gerant.kissosso@totalenergies.gn  →  🏢 Gérant Kissosso
gerant.matam@totalenergies.gn  →  🏢 Gérant Matam
cdp.kissosso@totalenergies.gn  →  ⛽ Chef de Piste
caisse.kissosso@totalenergies.gn  →  💰 Caissière
Comptes démo (mot de passe : admin)

Nom de la base de donnees et son mot de passe : totalenerigines_kissosso 12345.TOTALENERGIES