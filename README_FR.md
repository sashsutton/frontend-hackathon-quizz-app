# Frontend pour l'Application Quiz du Hackathon AMU 2026

## Aperçu
Ce frontend fournit une interface utilisateur pour l'application de quiz conçue pour renforcer la cohésion entre les étudiants en licence et master d'informatique à l'Université d'Aix-Marseille. Il interagit avec le backend pour faciliter les interactions basées sur des quiz entre les étudiants de premier et deuxième cycle.

## Fonctionnalités
- Authentification des utilisateurs
- Création et participation aux quiz
- Mode duel pour des quiz compétitifs
- Interactions en temps réel

## Configuration

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation
1. Clonez le dépôt :
   ```bash
   git clone <repository-url>
   cd frontend-hackathon-quizz-app
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Définissez les variables d'environnement :
   ```bash
   export VITE_BACKEND_URL=http://localhost:5000
   ```

4. Exécutez l'application :
   ```bash
   npm run dev
   ```

## Structure du Projet
```
frontend-hackathon-quizz-app/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── App.vue
│   └── main.js
├── index.html
├── package.json
└── vite.config.js
```

## Licence
MIT
