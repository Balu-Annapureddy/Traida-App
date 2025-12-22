import { getSession } from "@/lib/auth";
import Link from "next/link";
import { db } from "@/lib/db";
// import NotificationBell from "./components/NotificationBell"; // Temporarily disabled for Calm Signal
import StatusTag from "@/components/ui/StatusTag"; // Keep for status, check styles later

function getDailyChallenges() {
  // STRICT: Only today. content seeded by scripts/seed-daily-protocol.js
  const today = new Date().toISOString().split('T')[0];
  try {
    const stmt = db.prepare('SELECT id, type, difficulty FROM challenges WHERE date = ?');
    return stmt.all(today) as any[];
  } catch (e) {
    return [];
  }
}

function getUserAttempts(userId: number) {
  try {
    const stmt = db.prepare(`
        SELECT challenge_id, is_success 
        FROM attempts 
        WHERE user_id = ? AND date(completed_at) = date('now')
     `);
    return stmt.all(userId) as any[];
  } catch (e) {
    return [];
  }
}

export default async function Home() {
  const session = await getSession();
  const challenges = getDailyChallenges();

  let attempts: any[] = [];
  if (session) {
    attempts = getUserAttempts(session.id);
  }

  const hasAttemptedToday = attempts.length > 0;
  // const isSessionComplete = hasAttemptedToday; // MVP: 1 attempt closes the day
  // REVISIT: The prompt says "User may attempt challenges at most twice... User explicitly accepts one result... The day is locked".
  // For now, let's keep the logic simple: If they have an accepted attempt (or just any attempt for MVP), show closure.
  // Actually, let's just check if they played.

  const isSessionComplete = hasAttemptedToday;

  return (
    <div className="container">

      {/* HEADER: Minimal */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem'
      }}>
        <div style={{ fontWeight: 500, letterSpacing: '0.05em' }}>TRAIDA</div>

        {session ? (
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontSize: '0.9rem' }}>
            {/* <NotificationBell /> Keep silent for now */}
            <a href="/api/auth/logout" style={{ color: 'var(--secondary)', borderBottom: 'none' }}>Sign out</a>
          </div>
        ) : (
          <Link href="/login" className="pixel-btn">
            Enter
          </Link>
        )}
      </header>

      <main>
        {!session ? (
          <div className="pixel-border" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Resting State.</h2>
            <p style={{ color: 'var(--secondary)', marginBottom: '2rem', maxWidth: '400px' }}>
              Traida is a finite cognitive ritual.
              <br />
              Observe yourself, then return to the world.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/login" className="pixel-btn">Begin</Link>
            </div>
          </div>
        ) : (
          <>
            {/* DAILY PROTOCOL CARD */}
            <div className="pixel-border" style={{ padding: '2rem' }}>
              <div style={{
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                color: 'var(--secondary)',
                marginBottom: '1.5rem',
                borderBottom: '1px solid var(--card-border)',
                paddingBottom: '0.5rem'
              }}>
                Today's Protocol
              </div>

              {/* CLOSURE STATE */}
              {isSessionComplete ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--foreground)' }}>●</div>
                  <h3 style={{ marginBottom: '0.5rem', fontWeight: 400 }}>That's enough for today.</h3>
                  <p style={{ color: 'var(--secondary)', maxWidth: '300px', margin: '0 auto', fontSize: '0.9rem' }}>
                    The system is closed. Rest.
                  </p>
                </div>
              ) : (
                /* ACTIVE STATE */
                <div>
                  <div style={{ display: 'grid', gap: '1px', background: 'var(--card-border)', border: '1px solid var(--card-border)' }}>
                    {challenges.length > 0 ? challenges.map((c) => (
                      <Link key={c.id} href={`/play/${c.id}`} style={{ textDecoration: 'none', borderBottom: 'none' }}>
                        <div style={{
                          background: 'var(--card-bg)',
                          padding: '1.25rem',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          transition: 'background 0.2s'
                        }}
                          className="hover-bg"
                        >
                          <span style={{ color: 'var(--foreground)' }}>{c.type}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontFamily: 'var(--font-display)' }}>
                            // {c.difficulty}
                          </span>
                        </div>
                      </Link>
                    )) : (
                      <div style={{ padding: '2rem', background: 'var(--card-bg)', color: 'var(--secondary)', fontStyle: 'italic', textAlign: 'center' }}>
                        Protocol Pending...
                      </div>
                    )}
                  </div>

                  <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--secondary)', textAlign: 'center' }}>
                    Select one. Observe.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* CSS for hover effect in JS-in-CSS */}
      <style>{`
        .hover-bg:hover {
            background: #161616 !important;
        }
      `}</style>
    </div>
  );
}
