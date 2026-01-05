# Fumotion TUI

🚗 Application Terminal (TUI) pour la plateforme de covoiturage Fumotion.

![Ink](https://img.shields.io/badge/Built%20with-Ink-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)

## Installation

```bash
# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
```

## Utilisation

```bash
# Mode développement
npm run dev

# Build et lancement
npm run build
npm start
```

## Configuration

Créez un fichier `.env` à la racine :

```env
API_URL=http://137.74.47.37:5000
```

## Fonctionnalités

- 🔐 **Authentification** - Connexion et inscription
- 🔍 **Recherche de trajets** - Filtres par lieu et date
- 🚗 **Mes trajets** - Créer, modifier, annuler
- 📋 **Réservations** - Réserver et gérer les réservations
- 💬 **Messagerie** - Chat avec conducteurs/passagers
- ⭐ **Avis** - Noter les trajets effectués
- 👤 **Profil** - Voir et modifier son profil
- 🔧 **Admin** - Panel d'administration (si admin)

## Stack Technique

- **Ink** - React pour le terminal
- **TypeScript** - Typage statique
- **conf** - Stockage persistant du token

## Connexion au Backend

L'application se connecte au backend Fumotion existant via son API REST.
