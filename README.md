# Vegetable Shop App (with Database Integration)

A full-stack vegetable shop app built with:
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python HTTP server (`app.py`)
- **Database**: SQLite (`sqlite3`, built into Python)

## Features

- Add vegetables to inventory
- View inventory from the database
- Restock or delete items
- Record purchases (sales)
- Auto-update stock after purchase
- View sales summary (units sold + total revenue)

## Run locally

```bash
python app.py
```

Open: `http://localhost:3000`

## API Endpoints

- `GET /api/vegetables`
- `POST /api/vegetables`
- `PUT /api/vegetables/:id`
- `DELETE /api/vegetables/:id`
- `POST /api/purchase`
- `GET /api/sales`

## Database

The app creates `shop.db` automatically with:
- `vegetables` table
- `sales` table

It also seeds default vegetables on first launch.
