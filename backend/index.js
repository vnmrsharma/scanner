// const express = require('express');
// const sqlite3 = require('sqlite3').verbose();
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const app = express();
// const db = new sqlite3.Database('./barcode.db');

// app.use(cors());
// app.use(bodyParser.json());

// // Initialize database table with scanner_id and scanned_at columns
// db.run(`
//     CREATE TABLE IF NOT EXISTS barcodes (
//         id INTEGER PRIMARY KEY,
//         barcode TEXT UNIQUE,
//         scanner_id TEXT,
//         scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP
//     )
// `);

// // API to add barcode
// app.post('/add-barcode', (req, res) => {
//     const { barcode, scanner_id } = req.body;

//     // Check for duplicate barcode
//     db.get('SELECT * FROM barcodes WHERE barcode = ?', [barcode], (err, row) => {
//         if (err) {
//             return res.status(500).json({ error: 'Database error' });
//         }
//         if (row) {
//             // Duplicate found
//             return res.status(400).json({
//                 error: 'Duplicate barcode detected',
//                 duplicate: {
//                     scanner_id: row.scanner_id,
//                     scanned_at: row.scanned_at
//                 }
//             });
//         } else {
//             // Insert new barcode
//             db.run(
//                 'INSERT INTO barcodes (barcode, scanner_id) VALUES (?, ?)',
//                 [barcode, scanner_id],
//                 (err) => {
//                     if (err) {
//                         return res.status(500).json({ error: 'Database error' });
//                     }
//                     res.json({ message: 'Barcode added successfully' });
//                 }
//             );
//         }
//     });
// });

// app.get('/barcodes', (req, res) => {
//     const sql = 'SELECT * FROM barcodes ORDER BY scanned_at DESC';
//     db.all(sql, [], (err, rows) => {
//         if (err) {
//             return res.status(500).json({ error: 'Database error' });
//         }
//         res.json({ barcodes: rows });
//     });
// });

// Start server
// const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const db = new sqlite3.Database('./barcode.db');

app.use(cors());
app.use(bodyParser.json());

// Initialize database table with scanner_id and scanned_at columns
db.run(`
    CREATE TABLE IF NOT EXISTS barcodes (
        id INTEGER PRIMARY KEY,
        barcode TEXT,
        scanner_id TEXT,
        scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// API to add barcode
app.post('/add-barcode', (req, res) => {
    const { barcode, scanner_id } = req.body;

    // Check for duplicate barcode
    db.get('SELECT * FROM barcodes WHERE barcode = ?', [barcode], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (row) {
            // Duplicate found
            return res.status(400).json({
                error: 'Duplicate barcode detected',
                duplicate: {
                    scanner_id: row.scanner_id,
                    scanned_at: row.scanned_at
                }
            });
        } else {
            // Insert new barcode
            db.run(
                'INSERT INTO barcodes (barcode, scanner_id) VALUES (?, ?)',
                [barcode, scanner_id],
                (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }
                    res.json({ message: 'Barcode added successfully' });
                }
            );
        }
    });
});

// API to retrieve duplicated barcodes
app.get('/report', (req, res) => {
    const sql = `
        SELECT barcode, COUNT(*) as count, MIN(scanned_at) as first_scanned_at
        FROM barcodes
        GROUP BY barcode
        HAVING count > 1
        ORDER BY first_scanned_at DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ duplicates: rows });
    });
});

app.get('/barcodes', (req, res) => {
    const sql = 'SELECT * FROM barcodes ORDER BY scanned_at DESC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ barcodes: rows });
    });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
