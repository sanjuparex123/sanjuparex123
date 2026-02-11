import json
import sqlite3
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / 'shop.db'


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_conn()
    cur = conn.cursor()
    cur.executescript(
        '''
        CREATE TABLE IF NOT EXISTS vegetables (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL CHECK(price >= 0),
            stock INTEGER NOT NULL CHECK(stock >= 0),
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vegetable_id INTEGER NOT NULL,
            vegetable_name TEXT NOT NULL,
            quantity INTEGER NOT NULL CHECK(quantity > 0),
            unit_price REAL NOT NULL,
            total_price REAL NOT NULL,
            sold_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(vegetable_id) REFERENCES vegetables(id)
        );
        '''
    )
    total = cur.execute('SELECT COUNT(*) FROM vegetables').fetchone()[0]
    if total == 0:
        seed = [
            ('Tomato', 'Fresh Produce', 2.5, 80),
            ('Potato', 'Root Vegetable', 1.8, 120),
            ('Carrot', 'Root Vegetable', 2.2, 95),
            ('Spinach', 'Leafy Green', 1.5, 70),
            ('Onion', 'Kitchen Essential', 1.9, 100),
        ]
        cur.executemany(
            'INSERT INTO vegetables (name, category, price, stock) VALUES (?, ?, ?, ?)',
            seed,
        )
    conn.commit()
    conn.close()


class Handler(BaseHTTPRequestHandler):
    def _json(self, status, data):
        payload = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def _read_json(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length) if length else b'{}'
        return json.loads(body.decode('utf-8'))

    def _serve_file(self, filename, content_type):
        path = ROOT / filename
        if not path.exists():
            self.send_error(404)
            return
        content = path.read_bytes()
        self.send_response(200)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def do_GET(self):
        parsed = urlparse(self.path)
        conn = get_conn()
        cur = conn.cursor()

        if parsed.path == '/':
            conn.close()
            return self._serve_file('index.html', 'text/html; charset=utf-8')
        if parsed.path == '/style.css':
            conn.close()
            return self._serve_file('style.css', 'text/css; charset=utf-8')
        if parsed.path == '/script.js':
            conn.close()
            return self._serve_file('script.js', 'text/javascript; charset=utf-8')

        if parsed.path == '/api/vegetables':
            rows = [dict(row) for row in cur.execute('SELECT * FROM vegetables ORDER BY id DESC').fetchall()]
            conn.close()
            return self._json(200, rows)

        if parsed.path == '/api/sales':
            rows = [
                dict(row)
                for row in cur.execute(
                    'SELECT id, vegetable_name, quantity, unit_price, total_price, sold_at FROM sales ORDER BY id DESC LIMIT 20'
                ).fetchall()
            ]
            summary_row = cur.execute(
                'SELECT COALESCE(SUM(total_price), 0) AS revenue, COALESCE(SUM(quantity), 0) AS unitsSold FROM sales'
            ).fetchone()
            conn.close()
            return self._json(200, {'summary': dict(summary_row), 'rows': rows})

        conn.close()
        self.send_error(404)

    def do_POST(self):
        parsed = urlparse(self.path)
        payload = self._read_json()
        conn = get_conn()
        cur = conn.cursor()

        if parsed.path == '/api/vegetables':
            name = str(payload.get('name', '')).strip()
            category = str(payload.get('category', '')).strip()
            price = float(payload.get('price', -1))
            stock = int(payload.get('stock', -1))
            if not name or not category or price < 0 or stock < 0:
                conn.close()
                return self._json(400, {'error': 'Invalid vegetable details provided.'})
            cur.execute(
                'INSERT INTO vegetables (name, category, price, stock) VALUES (?, ?, ?, ?)',
                (name, category, price, stock),
            )
            conn.commit()
            row = cur.execute('SELECT * FROM vegetables WHERE id = ?', (cur.lastrowid,)).fetchone()
            conn.close()
            return self._json(201, dict(row))

        if parsed.path == '/api/purchase':
            vegetable_id = int(payload.get('vegetableId', 0))
            quantity = int(payload.get('quantity', 0))
            if vegetable_id <= 0 or quantity <= 0:
                conn.close()
                return self._json(400, {'error': 'vegetableId and positive quantity are required.'})

            vegetable = cur.execute('SELECT * FROM vegetables WHERE id = ?', (vegetable_id,)).fetchone()
            if not vegetable:
                conn.close()
                return self._json(404, {'error': 'Vegetable not found.'})
            if vegetable['stock'] < quantity:
                conn.close()
                return self._json(400, {'error': f"Only {vegetable['stock']} in stock."})

            total = round(vegetable['price'] * quantity, 2)
            cur.execute('UPDATE vegetables SET stock = stock - ? WHERE id = ?', (quantity, vegetable_id))
            cur.execute(
                'INSERT INTO sales (vegetable_id, vegetable_name, quantity, unit_price, total_price, sold_at) VALUES (?, ?, ?, ?, ?, ?)',
                (
                    vegetable_id,
                    vegetable['name'],
                    quantity,
                    vegetable['price'],
                    total,
                    datetime.utcnow().isoformat(timespec='seconds'),
                ),
            )
            conn.commit()
            sale = cur.execute('SELECT * FROM sales WHERE id = ?', (cur.lastrowid,)).fetchone()
            conn.close()
            return self._json(201, dict(sale))

        conn.close()
        self.send_error(404)

    def do_PUT(self):
        parsed = urlparse(self.path)
        if not parsed.path.startswith('/api/vegetables/'):
            return self.send_error(404)

        payload = self._read_json()
        vegetable_id = int(parsed.path.rsplit('/', 1)[-1])

        conn = get_conn()
        cur = conn.cursor()
        row = cur.execute('SELECT * FROM vegetables WHERE id = ?', (vegetable_id,)).fetchone()
        if not row:
            conn.close()
            return self._json(404, {'error': 'Vegetable not found.'})

        name = str(payload.get('name', row['name'])).strip()
        category = str(payload.get('category', row['category'])).strip()
        price = float(payload.get('price', row['price']))
        stock = int(payload.get('stock', row['stock']))

        if not name or not category or price < 0 or stock < 0:
            conn.close()
            return self._json(400, {'error': 'Invalid vegetable details provided.'})

        cur.execute(
            'UPDATE vegetables SET name = ?, category = ?, price = ?, stock = ? WHERE id = ?',
            (name, category, price, stock, vegetable_id),
        )
        conn.commit()
        updated = cur.execute('SELECT * FROM vegetables WHERE id = ?', (vegetable_id,)).fetchone()
        conn.close()
        return self._json(200, dict(updated))

    def do_DELETE(self):
        parsed = urlparse(self.path)
        if not parsed.path.startswith('/api/vegetables/'):
            return self.send_error(404)

        vegetable_id = int(parsed.path.rsplit('/', 1)[-1])
        conn = get_conn()
        cur = conn.cursor()
        cur.execute('DELETE FROM vegetables WHERE id = ?', (vegetable_id,))
        conn.commit()
        deleted = cur.rowcount
        conn.close()

        if deleted == 0:
            return self._json(404, {'error': 'Vegetable not found.'})

        self.send_response(204)
        self.end_headers()


if __name__ == '__main__':
    init_db()
    server = ThreadingHTTPServer(('0.0.0.0', 3000), Handler)
    print('Vegetable shop app running at http://localhost:3000')
    server.serve_forever()
