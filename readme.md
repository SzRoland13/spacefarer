# Galactic Spacefarer

SAP CAP backend for the Galactic Spacefarer assignment, using TypeScript and SQLite.

## Running locally

Requires Node.js 22 or newer.

```sh
npm ci
npm run deploy:local
npm run dev
```

Service URL: `http://localhost:4004/odata/v4/spacefarer/`

The database is saved in `spacefarer.sqlite`. The initial data includes two planets,
departments, and a position.

## Local users

| Username | Password    |
| -------- | ----------- |
| alice    | alice-local |
| bob      | bob-local   |

These accounts use Basic authentication for local development.

Each user needs to choose a planet before accessing spacefarers. Read the available
planets at `/Planets`, then call `choosePlanet` with the selected ID:

```sh
curl -u alice:alice-local -X POST \
  -H 'Content-Type: application/json' \
  -d '{"planet_ID":"11111111-1111-4111-8111-111111111111"}' \
  http://localhost:4004/odata/v4/spacefarer/choosePlanet
```

The choice is saved and cannot be changed. `/getMyPlanet()` returns the current
choice, and `/Spacefarers` lists spacefarers from that planet.

Users can create, edit, and delete spacefarers on their own planet. Planets,
departments, and positions are read-only. A selected position must exist and belong
to the selected department.

To try the access restrictions, choose Planet X for Alice and Planet Y for Bob.
They should each see only their own planet's spacefarers, including when following
links to a spacefarer's planet, department, or position.
