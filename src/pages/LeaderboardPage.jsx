import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

const API = 'http://127.0.0.1:5000';

export default function LeaderboardPage() {
    const { getToken, isLoaded } = useAuth();
    const [board, setBoard] = useState([]);
    const [myClerkId, setMyClerkId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded) return;
        (async () => {
            try {
                const token = await getToken();
                const [lbRes, meRes] = await Promise.all([
                    axios.get(`${API}/leaderboard`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                if (lbRes.data.success) setBoard(lbRes.data.leaderboard);
                if (meRes.data.success) setMyClerkId(meRes.data.clerk_id);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, [isLoaded]);

    const rankLabel = (i) => {
        if (i === 0) return { text: '01', color: 'var(--yellow)' };
        if (i === 1) return { text: '02', color: 'var(--dim)' };
        if (i === 2) return { text: '03', color: 'var(--orange)' };
        return { text: String(i + 1).padStart(2, '0'), color: 'var(--dim)' };
    };

    const eloTier = (elo) => {
        if (elo >= 1500) return { label: 'GOLD', color: 'var(--yellow)' };
        if (elo >= 1300) return { label: 'SILVER', color: 'var(--cyan)' };
        if (elo >= 1100) return { label: 'BRONZE', color: 'var(--orange)' };
        return { label: 'IRON', color: 'var(--dim)' };
    };

    if (loading) return (
        <div className="retro-page">
            <div className="retro-spinner" />
            <p style={{ fontFamily: 'var(--font-hud)', color: 'var(--yellow)', marginTop: 24, letterSpacing: '0.15em', fontSize: 12 }}>CHARGEMENT...</p>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', padding: '80px 20px 60px', maxWidth: 860, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <h1 className="retro-title" style={{ color: 'var(--yellow)', textShadow: '0 0 15px var(--yellow), 0 0 40px rgba(255,255,0,0.3)', fontSize: 'clamp(16px, 3vw, 28px)' }}>
                    HALL OF FAME
                </h1>
                <p className="retro-subtitle" style={{ color: 'var(--cyan)' }}>— TOP 50 PAR ELO —</p>
                <div style={{ width: 60, height: 2, background: 'var(--yellow)', margin: '20px auto 0', boxShadow: '0 0 10px var(--yellow)' }} />
            </div>

            {/* Table */}
            <div style={{ border: '1px solid rgba(0,255,255,0.2)', background: 'rgba(0,0,20,0.6)' }}>
                {/* Header row */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 80px 100px 90px 50px 50px',
                    gap: 8, padding: '12px 20px',
                    background: 'rgba(0,255,255,0.06)',
                    borderBottom: '1px solid rgba(0,255,255,0.2)',
                }}>
                    {['#', 'JOUEUR', 'PROMO', 'MENTION', 'ELO', 'V', 'D'].map(h => (
                        <span key={h} style={{ fontFamily: 'var(--font-hud)', fontSize: 10, color: 'var(--cyan)', letterSpacing: '0.1em' }}>
                            {h}
                        </span>
                    ))}
                </div>

                {board.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'var(--font-hud)', color: 'var(--dim)', fontSize: 12 }}>
                        AUCUN JOUEUR CLASSÉ
                    </div>
                ) : board.map((u, i) => {
                    const isMe = u.clerk_id === myClerkId;
                    const rank = rankLabel(i);
                    const tier = eloTier(u.elo ?? 1200);
                    return (
                        <div
                            key={u.clerk_id || i}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '60px 1fr 80px 100px 90px 50px 50px',
                                gap: 8, padding: '13px 20px',
                                borderBottom: '1px solid rgba(0,255,255,0.07)',
                                background: isMe
                                    ? 'rgba(255,0,255,0.07)'
                                    : i < 3 ? 'rgba(255,255,0,0.03)' : 'transparent',
                                borderLeft: isMe ? '2px solid var(--magenta)' : '2px solid transparent',
                            }}
                        >
                            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 12, color: rank.color, textShadow: i < 3 ? `0 0 8px ${rank.color}` : 'none' }}>
                                {rank.text}
                            </span>
                            <span style={{ fontFamily: 'var(--font-hud)', fontSize: 13, color: isMe ? 'var(--magenta)' : 'var(--white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}>
                                {u.first_name} {u.last_name}
                                {isMe && <span style={{ fontSize: 9, color: 'var(--magenta)', border: '1px solid var(--magenta)', padding: '1px 6px', letterSpacing: '0.1em' }}>YOU</span>}
                            </span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--dim)' }}>{u.promotion || '—'}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.mention || '—'}</span>
                            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 12, color: tier.color, textShadow: `0 0 6px ${tier.color}` }}>
                                {u.elo ?? 1200}
                            </span>
                            <span style={{ fontFamily: 'var(--font-hud)', fontSize: 13, color: 'var(--green)', textAlign: 'center' }}>{u.wins ?? 0}</span>
                            <span style={{ fontFamily: 'var(--font-hud)', fontSize: 13, color: 'var(--magenta)', textAlign: 'center' }}>{u.losses ?? 0}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
