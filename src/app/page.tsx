import { getSession } from "@/lib/auth";
import Link from "next/link";
import { db } from "@/lib/db";
import NotificationBell from "./components/NotificationBell";

// Helper to get challenges
function getDailyChallenges() {
  const today = new Date().toISOString().split('T')[0];
  try {
    const stmt = db.prepare('SELECT id, type, difficulty FROM challenges WHERE date_active = ?');
    return stmt.all(today) as any[];
  } catch (e) {
    return [];
  }
}

// Helper to get user attempts for today
function getUserAttempts(userId: number) {
  const today = new Date().toISOString().split('T')[0];
  try {
    // Join to check date? Or just check attempts made today?
    // Attempts has timestamp.
    const stmt = db.prepare(`
        SELECT challenge_id, is_success 
        FROM attempts 
        WHERE user_id = ? AND date(timestamp) = date('now')
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
    attempts = getUserAttempts(session.user.id);
  }

  const hasAttemptedToday = attempts.length > 0;
  const attemptedIds = new Set(attempts.map(a => a.challenge_id));

  return (
    <div className="container">
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4rem'
      }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--primary)' }}>TRAIDA</h1>
        <div>
          {session ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link href="/amigos" className="pixel-btn" style={{ fontSize: '0.8rem', padding: '5px 10px' }}>AMIGOS</Link>
              <Link href="/shop" className="pixel-btn" style={{ fontSize: '0.8rem', padding: '5px 10px', color: 'gold' }}>MARKET</Link>
              <Link href="/clubs" className="pixel-btn" style={{ fontSize: '0.8rem', padding: '5px 10px' }}>CLUBS</Link>
              <Link href="/insights" className="pixel-btn" style={{ fontSize: '0.8rem', padding: '5px 10px', color: 'cyan' }}>INSIGHTS</Link>
              <NotificationBell />
              <Link href="/profile" className="pixel-border" style={{ padding: '5px 10px', fontSize: '0.8rem', cursor: 'pointer', color: 'inherit' }}>
                USER: {session.user.username}
              </Link>
              <a href="/api/auth/logout" className="pixel-btn" style={{ fontSize: '0.8rem', padding: '5px 10px' }}>
                LOGOUT
              </a>
            </div>
          ) : (
            <Link href="/login" className="pixel-btn">
              ENTER_SYSTEM
            </Link>
          )}
        </div>
      </header>

      <main>
        <div className="pixel-border" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--secondary)' }}>DAILY_PROTOCOL</h2>
          <p style={{ margin: '1rem 0' }}>
            STATUS: {session ? (hasAttemptedToday ? 'COMPLETED' : 'AWAITING_INPUT') : 'LOCKED'}
          </p>

          {session && (
            <div style={{ marginBottom: '2rem' }}>
              <Link href="/liber" className="pixel-btn" style={{ borderStyle: 'dashed', opacity: 0.8 }}>
                ENTER_PRACTICE_MODE
              </Link>
            </div>
          )}

          {session ? (
            <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              {challenges.length > 0 ? challenges.map((c) => {
                const isLocked = hasAttemptedToday && !attemptedIds.has(c.id);
                const isCompleted = attemptedIds.has(c.id);

                // If completed or attempted, show status. 
                // If not attempted but user has attempted OTHER challenge, this is LOCKED (Single attempt rule).
                // Actually, verify rule: "User can attempt any ONE challenge... The other two are optional and do not affect ranking" ?
                // Wait, Phase 1 specs: "Only the first completed challenge counts... The other two are optional". 
                // BUT "Single-attempt only" per challenge?
                // The "Core Philosophy" says "Only 3 challenges/day... User can attempt any ONE challenge". 
                // "Only the first completed challenge counts for score... The other two are optional".
                // This implies they CAN play others.
                // HOWEVER, "Why this works: Prevents grinding".
                // Let's implement: First one counts for traits/score. Others are just for fun/practice? 
                // For MVP Phase 1 simplicity: Let's lock others for now or just mark them.
                // Re-reading MVP Scope Phase 1: "Daily 3 challenges (pick 1)".
                // Let's stick to "Pick 1" strictly for now.

                const disabled = isLocked;

                return (
                  <Link
                    key={c.id}
                    href={disabled ? '#' : `/play/${c.id}`}
                    className={`pixel-btn`}
                    style={{
                      opacity: disabled ? 0.5 : 1,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      background: isCompleted ? 'var(--secondary)' : 'var(--primary)',
                      color: '#000'
                    }}
                  >
                    <span>{c.type}</span>
                    <span style={{ fontSize: '0.7rem' }}>{c.difficulty}</span>
                    {isCompleted && <span>[SOLVED]</span>}
                    {disabled && <span>[LOCKED]</span>}
                  </Link>
                )
              }) : (
                <p>NO_DATA_AVAILABLE</p>
              )}
            </div>
          ) : (
            <p style={{ color: '#666' }}>AUTHENTICATION REQUIRED TO PARTICIPATE</p>
          )}
        </div>
      </main>
    </div>
  );
}
