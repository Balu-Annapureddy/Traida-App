const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traida.db');
const db = new Database(dbPath);

const ENGINES = [
    { type: 'SPEED', id: 'BINARY_PULSE', difficulty: 'EASY', data: { sequence: '010101' } },
    { type: 'LOGIC', id: 'CIRCUIT_BUILDER', difficulty: 'MEDIUM', data: { size: 3 } },
    { type: 'PATTERN', id: 'MIRROR_GRID', difficulty: 'HARD', data: { pattern: [1, 0, 1, 0, 1, 0, 1, 0] } },
    { type: 'ENCRYPTION', id: 'SHIFT_KEY', difficulty: 'MEDIUM', data: { shift: 3 } },
    { type: 'CREATIVITY', id: 'INKBLOT', difficulty: 'OPEN', data: { prompt: 'WHAT_DO_YOU_SEE?' } },
    { type: 'LOGIC', id: 'PIXEL_DOKU', difficulty: 'HARD', data: { missing: 3 } },
    { type: 'PATTERN', id: 'GLITCH_FIND', difficulty: 'EASY', data: { target: 'X' } },
    { type: 'SPEED', id: 'RAPID_CIPHER', difficulty: 'HARD', data: { timeout: 5000 } },
    { type: 'ENCRYPTION', id: 'SYMBOL_SUB', difficulty: 'MEDIUM', data: { key: 'A=1' } },
    { type: 'CREATIVITY', id: 'ECHO_PROMPT', difficulty: 'OPEN', data: { topic: 'SILENCE' } }
];

function seedDailyProtocol() {
    console.log('SYSTEM: ACTIVATING_PROTOCOL_SEEDER');

    const insertStmt = db.prepare(`
        INSERT INTO challenges (type, date, data_json, created_at)
        VALUES (?, ?, ?, datetime('now'))
    `);

    const checkStmt = db.prepare('SELECT id FROM challenges WHERE date = ?');

    let createdCount = 0;
    let skippedCount = 0;

    // Seed next 30 days
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        // IMMUTABILITY CHECK
        const existing = checkStmt.all(dateStr);
        if (existing.length > 0) {
            skippedCount++;
            continue;
        }

        // Generate 3 unique engines for the day
        const dayEngines = [...ENGINES].sort(() => 0.5 - Math.random()).slice(0, 3);

        for (const engine of dayEngines) {
            insertStmt.run(engine.type, dateStr, JSON.stringify(engine.data));
            createdCount++;
        }
    }

    console.log(`REPORT: ${createdCount} challenges created. ${skippedCount} days skipped (immutable).`);
}

seedDailyProtocol();
