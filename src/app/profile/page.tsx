import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import ConsoleCard from "@/components/ui/ConsoleCard";
import ConsoleButton from "@/components/ui/ConsoleButton";
import ProfileHeader from "./ProfileHeader";

export default async function ProfilePage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const user = db.prepare('SELECT id, username, coins, sp_coins, traits_json, archetype_id, created_at FROM users WHERE id = ?').get(session.id) as any;

    if (!user) redirect('/login');

    const traits = JSON.parse(user.traits_json || '{}');
    const traitKeys = ['LOGIC', 'SPEED', 'ETHICS', 'PATTERN'];

    return (
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '4rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.2rem', margin: 0 }}>Profile</h1>
                <Link href="/"><ConsoleButton variant="ghost" size="sm">Back</ConsoleButton></Link>
            </header>

            <ProfileHeader user={user} />

            <ConsoleCard title="Traits">
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {traitKeys.map(key => {
                        const val = traits[key] || 0;
                        const width = Math.min(100, (val / 10) * 100);

                        return (
                            <div key={key}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{key}</span>
                                    <span style={{ fontFamily: 'var(--font-mono)' }}>{val}</span>
                                </div>
                                <div style={{ height: '4px', background: 'var(--bg-app)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${width}%`, background: 'var(--accent-primary)' }}></div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                {/* <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1.5rem', textAlign: 'center' }}>
                    Traits evolve with every choice.
                </p> */}
            </ConsoleCard>
        </div>
    );
}
