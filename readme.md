# Galactic Spacefarer

SAP CAP and Fiori elements app for the Galactic Spacefarer assignment, using TypeScript and SQLite.

## Running locally

Requires Node.js 22 or newer.

```sh
npm ci
docker compose up -d
npm run deploy:local
npm run dev
```

Service URL: `http://localhost:4004/odata/v4/spacefarer/`

Keep the backend running and start the UI in another terminal:

```sh
npm run dev:ui
```

Open `http://localhost:8080/index.html`. `npm run build:ui` builds the frontend.

The database is saved in `spacefarer.sqlite`. The demo data includes two planets,
four departments, eight positions, and 20 spacefarers (10 per planet). Seeded
spacefarers have their final skill values and do not trigger bonuses or emails.
Running `npm run deploy:local` recreates the tables, including draft tables, and
resets existing records and planet choices.

## Local users

| Username | Password    |
| -------- | ----------- |
| alice    | alice-local |
| bob      | bob-local   |

These accounts use Basic authentication for local development.

Choose a planet on the first visit. The choice is saved and cannot be changed.
Returning users go straight to the spacefarer list.

Users can create, edit, and delete spacefarers on their own planet. Planets,
departments, and positions are read-only. A selected position must exist and belong
to the selected department.

Use Create to add a candidate, or open a row to view and edit it. Changes are kept
as drafts until saved; Discard Draft cancels edits. The list supports filters,
sorting, and loading more rows.

To try the access restrictions, choose Planet X for Alice and Planet Y for Bob.
They should each see only their own planet's spacefarers, including when following
links to a spacefarer's planet, department, or position.
Use a separate private browser session to try the other user.

## Welcome bonus and email

Saving a new spacefarer adds 10 stardust and 5 wormhole navigation points (up to
100). The default starting values become 10 and 6. Drafts and later edits do not
receive another bonus.

A welcome email is sent after the new spacefarer is committed to the database.
Mailpit catches local emails; open `http://localhost:8025` to read them. Docker
is needed for `docker compose up -d`; stop Mailpit with `docker compose down`.
Its inbox is temporary and does not deliver to real email addresses.

SMTP defaults to `127.0.0.1:1025`, with sender
`Galactic Spacefarer <welcome@spacefarer.test>`. Override these using `SMTP_HOST`,
`SMTP_PORT`, and `EMAIL_FROM`. If sending fails, the error is logged and the
spacefarer stays saved. Failed emails are not retried automatically.
