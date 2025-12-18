import { getSession } from "@/lib/auth";
import Link from "next/link";
// import { logout } from "@/lib/auth"; // We can't use server action here directly in component prop easily without wrapping

export default async function Home() {
  const session = await getSession();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
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
              <span className="pixel-border" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>
                USER: {session.user.username}
              </span>
              {/* Temporary Logout Link to api route */}
              <Link href="/login" className="pixel-btn" style={{ fontSize: '0.8rem', padding: '5px 10px' }}>
                LOGOUT
              </Link>
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
          <h2 style={{ color: 'var(--secondary)' }}>DAILY_CHALLENGES</h2>
          <p style={{ margin: '1rem 0' }}>
            STATUS: {session ? 'READY' : 'LOCKED'}
          </p>

          {session ? (
            <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
              <button className="pixel-btn">LOGIC_PUZZLE_01</button>
              <button disabled className="pixel-btn" style={{ opacity: 0.5, cursor: 'not-allowed' }}>LOCKED</button>
              <button disabled className="pixel-btn" style={{ opacity: 0.5, cursor: 'not-allowed' }}>LOCKED</button>
            </div>
          ) : (
            <p style={{ color: '#666' }}>AUTHENTICATION REQUIRED TO PARTICIPATE</p>
          )}
        </div>
      </main>
    </div>
  );
}
