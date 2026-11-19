# Lockspot

Coffre-fort numérique qu'on n'ouvre qu'à un endroit précis : il faut être à moins de 30 m du coffre et valider la biométrie du téléphone. Le contenu (fichiers, photos, dossiers) est chiffré et reste sur le téléphone.

Expo SDK 57 · TypeScript · Expo Router · Mapbox · Firebase (Auth + Firestore)

## Prérequis

- Node.js 20.19.4 ou plus récent
- EAS CLI : `npm install -g eas-cli`, puis `eas login`
- Un téléphone Android ou iOS (l'appli utilise un build de développement, pas Expo Go)

## Lancer le projet

1. Installer les dépendances :

   ```bash
   npm install
   ```

2. Créer le fichier d'environnement, puis renseigner le jeton Mapbox et la configuration Firebase :

   ```bash
   cp .env.example .env.local
   ```

3. Construire le build de développement, puis l'installer sur le téléphone (lien ou QR code donné par EAS) :

   ```bash
   npm run build:dev
   ```

   À refaire seulement quand une bibliothèque native est ajoutée.

4. Démarrer le serveur, puis ouvrir « Lockspot Dev » sur le téléphone :

   ```bash
   npm run dev
   ```

   Si le téléphone n'est pas sur le même réseau que l'ordinateur : `npm run dev:tunnel`.

## Build de test

```bash
npm run build:preview
```

Produit un APK Android installable directement. Pour la production : `eas build --profile production`, puis `eas submit`.