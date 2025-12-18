const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traida.db');
const db = new Database(dbPath, { verbose: console.log });

console.log('--- Phase 3 Migration (Streak Shield Qty & Username Change) ---');

// 1. Add quantity to inventory
try {
    console.log('Checking inventory table...');
    const tableInfo = db.prepare("PRAGMA table_info(inventory)").all();
    const hasQuantity = tableInfo.some(col => col.name === 'quantity');

    if (!hasQuantity) {
        console.log('Adding quantity column to inventory...');
        db.exec("ALTER TABLE inventory ADD COLUMN quantity INTEGER DEFAULT 1;");
        console.log('✅ inventory.quantity column added.');
    } else {
        console.log('ℹ️ inventory.quantity already exists.');
    }
} catch (err) {
    console.error('❌ Error updating inventory:', err.message);
}

// 2. Add last_username_change to users
try {
    console.log('Checking users table...');
    const userInfo = db.prepare("PRAGMA table_info(users)").all();
    const hasLastChange = userInfo.some(col => col.name === 'last_username_change');

    if (!hasLastChange) {
        console.log('Adding last_username_change column to users...');
        db.exec("ALTER TABLE users ADD COLUMN last_username_change DATETIME;");
        console.log('✅ users.last_username_change column added.');
    } else {
        console.log('ℹ️ users.last_username_change already exists.');
    }
} catch (err) {
    console.error('❌ Error updating users:', err.message);
}

console.log('--- Migration Complete ---');
