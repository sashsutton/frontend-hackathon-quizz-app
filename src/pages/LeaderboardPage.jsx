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
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, [isLoaded]);

    const rankMedal = (i) => {
        if (i === 0) return '🥇';
        if (i === 1) return '🥈';
        if (i === 2) return '🥉';
        return `#${i + 1}`;
    };

    const eloColor = (elo) => {
        if (elo >= 1500) return '#f1c40f';
        if (elo >= 1300) return '#a29bfe';
        if (elo >= 1100) return '#3498db';
        return '#b2bec3';
    };

    if (loading) {
        return (
            <div style={s.page}>
                <style>{spin}</style>
                <div style={s.spinner} />
            </div>
        );
    }

    return (
        <div style={s.page}>
            <style>{spin}</style>
            <div style={s.container}>
                <div style={s.header}>
                    <h1 style={s.title}>🏆 Classement général</h1>
                    <p style={s.sub}>Les meilleurs joueurs, triés par ELO</p>
                    <div style={s.underline} />
                </div>

                {board.length === 0 ? (
                    <div style={s.empty}>Aucun joueur classé pour le moment.</div>
                ) : (
                    <div style={s.table}>
                        {/* Header */}
                        <div style={{ ...s.row, ...s.headerRow }}>
                            <span style={s.colRank}>Rang</span>
                            <span style={s.colName}>Joueur</span>
                            <span style={s.colInfo}>Promo</span>
                            <span style={s.colInfo}>Mention</span>
                            <span style={s.colElo}>ELO</span>
                            <span style={s.colStat}>V</span>
                            <span style={s.colStat}>D</span>
                        </div>

                        {board.map((u, i) => {
                            const isMe = u.clerk_id === myClerkId;
                            return (
                                <div
                                    key={u.clerk_id || i}
                                    style={{
                                        ...s.row,
                                        ...(isMe ? s.myRow : {}),
                                        background: isMe
                                            ? 'rgba(232, 67, 147, 0.12)'
                                            : i < 3
                                                ? 'rgba(241, 196, 15, 0.05)'
                                                : 'transparent',
                                    }}
                                >
                                    <span style={{ ...s.colRank, fontSize: i < 3 ? '20px' : '15px', fontWeight: i < 3 ? 'bold' : '500' }}>
                                        {rankMedal(i)}
                                    </span>
                                    <span style={s.colName}>
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {u.first_name} {u.last_name}
                                        </span>
                                        {isMe && <span style={s.youBadge}>Vous</span>}
                                    </span>
                                    <span style={s.colInfo}>{u.promotion || '—'}</span>
                                    <span style={s.colInfo}>{u.mention || '—'}</span>
                                    <span style={{ ...s.colElo, color: eloColor(u.elo ?? 1200) }}>
                                        {u.elo ?? 1200}
                                    </span>
                                    <span style={{ ...s.colStat, color: '#2ecc71' }}>{u.wins ?? 0}</span>
                                    <span style={{ ...s.colStat, color: '#e74c3c' }}>{u.losses ?? 0}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

const spin = `@keyframes spin { to { transform: rotate(360deg); } }`;

const s = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        padding: '60px 20px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: 'white',
    },
    spinner: {
        width: '60px', height: '60px', borderRadius: '50%',
        border: '4px solid rgba(255,255,255,0.1)',
        borderTop: '4px solid #f1c40f',
        animation: 'spin 1s linear infinite',
        margin: '150px auto',
    },
    container: { maxWidth: '900px', margin: '0 auto' },
    header: { textAlign: 'center', marginBottom: '40px' },
    title: { fontSize: '2.5rem', fontWeight: '800', margin: '0 0 10px' },
    sub: { color: '#a29bfe', fontSize: '1.1rem', margin: '0 0 16px' },
    underline: { width: '60px', height: '4px', background: '#f1c40f', margin: '0 auto', borderRadius: '2px' },
    empty: { textAlign: 'center', color: '#a29bfe', padding: '60px', fontSize: '1.1rem' },
    table: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        overflow: 'hidden',
    },
    row: {
        display: 'grid',
        gridTemplateColumns: '60px minmax(140px, 1fr) 80px 110px 90px 48px 48px',
        alignItems: 'center',
        padding: '14px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        gap: '8px',
    },
    headerRow: {
        background: 'rgba(255,255,255,0.07)',
        color: '#a29bfe',
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    topRow: { background: 'rgba(241, 196, 15, 0.05)' },
    myRow: {
        border: '1px solid rgba(232, 67, 147, 0.3)',
    },
    colRank: { textAlign: 'center' },
    colName: { fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' },
    colInfo: { fontSize: '13px', color: '#a29bfe', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    colElo: { textAlign: 'center', fontSize: '17px', fontWeight: 'bold' },
    colStat: { textAlign: 'center', fontSize: '14px', fontWeight: '600' },
    youBadge: {
        background: 'linear-gradient(135deg, #e84393, #a855f7)',
        color: 'white', fontSize: '10px', padding: '2px 8px',
        borderRadius: '20px', fontWeight: '700',
    },
};
