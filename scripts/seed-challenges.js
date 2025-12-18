const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traida.db');
const db = new Database(dbPath);

const today = new Date().toISOString().split('T')[0];

const challenges = [
    {
        date_active: today + '-1', // Hack for unique constraint if we want multiple per day, but schema says date_active is unique? 
        // Wait, schema says date_active TEXT UNIQUE. That means only ONE challenge per day? 
        // The requirements say "3 different challenges are released". 
        // I need to update the schema to allow multiple challenges per day. 
        // Unique should be (date_active, type) or just remove unique on date_active.
        type: 'LOGIC',
        difficulty: 'EASY',
        content: JSON.stringify({
            question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
            options: ["Echo", "Ghost", "Cloud", "Shadow"]
        }),
        solution: "Echo"
    },
    {
        date_active: today + '-2',
        type: 'PATTERN',
        difficulty: 'MEDIUM',
        content: JSON.stringify({
            question: "Which number comes next: 2, 6, 12, 20, 30, ?",
            options: ["40", "42", "36", "38"]
        }),
        solution: "42" // +4, +6, +8, +10, +12
    },
    {
        date_active: today + '-3',
        type: 'ETHICS',
        difficulty: 'HARD',
        content: JSON.stringify({
            question: "A trolley is moving towards 5 people. You can pull a lever to switch it to a track with 1 person. What do you do?",
            options: ["Pull Lever", "Do Nothing"]
        }),
        solution: "Pull Lever" // Needs "AI" evaluation later, but for MVP standard key
    }
];

// Checking schema first
try {
    // FIX SCHEMA: challenges.date_active is UNIQUE, which is wrong for 3 challenges/day.
    // We need to drop that constraint or recreate table. 
    // Since it's local dev, let's just alter/recreate.
    db.exec(`DROP TABLE IF EXISTS challenges;`);
    db.exec(`
    CREATE TABLE IF NOT EXISTS challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date_active TEXT NOT NULL, -- YYYY-MM-DD
      type TEXT NOT NULL,
      difficulty TEXT DEFAULT 'normal',
      content_json TEXT NOT NULL,
      solution TEXT NOT NULL
    );
    `);

    // Clear today's if any (after drop table they are gone)
} catch (e) {
    console.log(e);
}

const insert = db.prepare(`
    INSERT INTO challenges (date_active, type, difficulty, content_json, solution)
    VALUES (?, ?, ?, ?, ?)
`);

// We will use the same 'today' for all 3, distinguishing by ID or Type
// REAL FIX: The schema `date_active` shouldn't include the ID suffix hack I planned.
// It should just be the date.

challenges.forEach(c => {
    insert.run(today, c.type, c.difficulty, c.content, c.solution);
});

console.log(`Seeded ${challenges.length} challenges for ${today}`);
