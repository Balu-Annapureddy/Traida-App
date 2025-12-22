import { db } from '@/lib/db';

export const CleanupService = {
    run: () => {
        // Delete messages > 48 hours
        const result = db.prepare(`
            DELETE FROM messages 
            WHERE timestamp < datetime('now', '-48 hours')
        `).run();

        const resultDM = db.prepare(`
            DELETE FROM dm_messages 
            WHERE timestamp < datetime('now', '-48 hours')
        `).run();

        console.log(`[CLEANUP] Deleted ${result.changes} public messages and ${resultDM.changes} DMs.`);
        return { public: result.changes, dm: resultDM.changes };
    }
};
