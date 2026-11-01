# Sa Gatonera – Backend

API REST de l'aplicació web d'adopció de gats de Sa Gatonera, una associació de Blanes dedicada a la protecció i cura dels gats. Forma part d'un Treball Final de Màster (Màster universitari en Desenvolupament de Llocs i Aplicacions Web, UOC).

Aquest repositori conté només el backend. El frontend (Angular) és en un repositori independent: `sa-gatonera-frontend`.

## Tecnologies

- NestJS (TypeScript)
- TypeORM
- PostgreSQL
- Docker
- Swagger

## Requisits

- Node.js 24
- npm
- Docker Desktop

## Posada en marxa

1. Instal·lar les dependències:

   ```bash
   npm install
   ```

2. Crear el fitxer de configuració a partir de la plantilla:

   ```bash
   cp .env.example .env
   ```

   Configurar les credencials de la base de dades i les variables necessàries. El fitxer `.env` no s'ha de pujar al repositori.

3. Iniciar la base de dades:

   ```bash
   docker compose up -d
   ```

4. Executar les migracions:

   ```bash
   npm run migration:run
   ```

5. Carregar les dades d'exemple:

   ```bash
   npm run seed
   ```

6. Iniciar el servidor:

   ```bash
   npm run start:dev
   ```

L'API estarà disponible a `http://localhost:3000/api`.

La documentació de l'API es pot consultar a `http://localhost:3000/api/docs`.

## Variables d'entorn

Les variables necessàries per configurar la connexió amb PostgreSQL i l'origen autoritzat del frontend es troben al fitxer `.env.example`, que serveix de plantilla per crear el fitxer `.env`.

## Comandes disponibles

| Comanda                      | Descripció                                 |
| ---------------------------- | ------------------------------------------ |
| `npm run start:dev`          | Inicia el servidor en mode desenvolupament |
| `npm run build`              | Compila el projecte                        |
| `npm run migration:generate` | Genera una migració                        |
| `npm run migration:run`      | Executa les migracions pendents            |
| `npm run migration:revert`   | Reverteix l'última migració                |
| `npm run seed`               | Carrega les dades d'exemple                |

## Base de dades

Per consultar les dades es pot utilitzar pgAdmin amb la connexió `localhost`, port `5432` i les credencials configurades al fitxer `.env`.

Per aturar el contenidor sense eliminar les dades:

```bash
docker compose down
```
