# quizzmaster-backend

## Développer en local avec un terminal par service

Plutôt que de tout lancer via Docker Compose et d'avoir les logs mélangés, vous pouvez faire tourner l'infrastructure de base (Postgres, RabbitMQ) dans Docker, et lancer chaque microservice Node.js manuellement dans son propre terminal.

**Attention très importante :** Contrairement à Docker où chaque service est isolé et peut utiliser le port 3000 en interne, sur votre machine physique (localhost), **vous devez attribuer un port différent à chaque service** pour éviter un conflit (erreur `EADDRINUSE`).

### Prérequis

Setup de prisma :

Placez-vous dans le dossier `packages/prisma` et exécutez la commande suivante pour initialiser la base de données :

```bash
cd packages/prisma
yarn pnpify prisma migrate dev --name init
```

Ensuite pour générer le client Prisma, exécutez la commande suivante :

```bash
yarn workspace @quizzmaster-backend/prisma run pnpify prisma generate
```

### 1. Lancer l'infrastructure (Bases de données & Message Broker)

Démarrez uniquement Postgres, RabbitMQ et Nginx avec la commande suivante :

```bash
docker compose -f docker-compose.dev.yml up -d
```

### 2. Lancer les microservices (un par terminal)

Chaque service possède désormais son propre fichier `.env` (ex: `packages/core/.env`) qui contient déjà les bonnes variables pour un usage local (les ports uniques, `localhost` pour la BDD et RabbitMQ).

Ouvrez un nouveau terminal pour **chaque** service, placez-vous à la racine du projet et exécutez simplement les commandes suivantes :

**Terminal 1 : Core Service** (S'exécute sur le port 3000)

```bash
yarn workspace @quizzmaster/core run start
```

**Terminal 2 : Room Service** (S'exécute sur le port 3002)

```bash
yarn workspace @quizzmaster/room run start
```

**Terminal 3 : Player Service** (S'exécute sur le port 3003)

```bash
yarn workspace @quizzmaster/player run start
```

**Terminal 4 : Spectator Service** (S'exécute sur le port 3004)

```bash
yarn workspace @quizzmaster/spectator run start
```

### 💡 Focus sur les différences réseaux

- **Base de données / RabbitMQ :** On utilise `localhost` (au lieu de `postgres` ou `rabbitmq`) car ces services exposent leurs ports externes sur ta machine.
- **NGINX :** L'API Gateway NGINX contenu dans le docker-compose n'est plus nécessaire ici. Si tu testes tes endpoints avec Postman ou ton front-end, tu devras interagir directement avec `http://localhost:3000` (pour le core), `http://localhost:3002` (pour la room), etc.
