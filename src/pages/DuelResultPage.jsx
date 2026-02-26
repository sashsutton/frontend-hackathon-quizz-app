import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

const API = 'http://127.0.0.1:5000';

export default function DuelResultPage() {
    const { duelId } = useParams();
    const navigate = useNavigate();
    const { getToken, isLoaded } = useAuth();
    const [duel, setDuel] = useState(null);
    const [myClerkId, setMyClerkId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded) return;
        (async () => {
            try {
                const token = await getToken();
                const [duelRes, meRes] = await Promise.all([
                    axios.get(`${API}/duel/${duelId}`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                setDuel(duelRes.data.duel);
                setMyClerkId(meRes.data.clerk_id);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, [isLoaded]);

    if (loading) {
        return (
            <div style={s.page}>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <div style={{ width: 70, height: 70, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #f1c40f', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    if (!duel) return <div style={s.page}><p>Duel introuvable.</p></div>;

    const isPlayer1 = duel.player1_id === myClerkId;
    const myScore = isPlayer1 ? duel.player1_score : duel.player2_score;
    const opponentScore = isPlayer1 ? duel.player2_score : duel.player1_score;
    const myName = isPlayer1 ? duel.player1_name : duel.player2_name;
    const opponentName = isPlayer1 ? duel.player2_name : duel.player1_name;

    const won = duel.winner_id === myClerkId;
    const draw = !duel.winner_id && duel.status === 'finished';

    const resultEmoji = won ? '🏆' : draw ? '🤝' : '💀';
    const resultText = won ? 'Victoire !' : draw ? 'Égalité !' : 'Défaite...';
    const resultColor = won ? '#2ecc71' : draw ? '#f1c40f' : '#e74c3c';
    const eloChange = won ? '+20' : draw ? '±0' : '-20';

    return (
        <div style={s.page}>
            <div style={s.card}>
                {/* Result header */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ fontSize: 72 }}>{resultEmoji}</div>
                    <h1 style={{ fontSize: 40, color: resultColor, margin: '12px 0 4px' }}>{resultText}</h1>
                    <p style={{ color: '#a29bfe', fontSize: 18 }}>
                        ELO : <strong style={{ color: resultColor }}>{eloChange}</strong>
                    </p>
                </div>

                {/* Score board */}
                <div style={s.scoreboard}>
                    <div style={s.player}>
                        <div style={{ ...s.playerAvatar, boxShadow: won ? '0 0 20px rgba(46,204,113,0.5)' : 'none' }}>
                            {(myName?.[0] ?? '?').toUpperCase()}
                        </div>
                        <p style={s.playerName}>{myName ?? 'Vous'} <span style={{ color: '#a29bfe', fontSize: 13 }}>(vous)</span></p>
                        <p style={{ ...s.playerScore, color: resultColor }}>{myScore}</p>
                    </div>

                    <div style={s.vs}>VS</div>

                    <div style={s.player}>
                        <div style={{ ...s.playerAvatar, background: 'linear-gradient(135deg, #3498db, #2c3e50)', boxShadow: !won && !draw ? '0 0 20px rgba(46,204,113,0.5)' : 'none' }}>
                            {(opponentName?.[0] ?? '?').toUpperCase()}
                        </div>
                        <p style={s.playerName}>{opponentName ?? 'Adversaire'}</p>
                        <p style={{ ...s.playerScore, color: !won && !draw ? '#2ecc71' : '#e74c3c' }}>{opponentScore}</p>
                    </div>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 16, marginTop: 36 }}>
                    <button onClick={() => navigate('/duel')} style={s.btn}>
                        ⚔️ Nouveau duel
                    </button>
                    <button onClick={() => navigate('/leaderboard')} style={{ ...s.btn, background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.2)' }}>
                        🏆 Classement
                    </button>
                </div>
            </div>
        </div>
    );
}

const s = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: 'white',
    },
    card: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24, padding: '48px 40px',
        width: '100%', maxWidth: 620,
    },
    scoreboard: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 20, padding: '32px 24px',
        border: '1px solid rgba(255,255,255,0.08)',
    },
    player: { textAlign: 'center', flex: 1 },
    playerAvatar: {
        width: 70, height: 70, borderRadius: '50%',
        background: 'linear-gradient(135deg, #e84393, #a855f7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 30, fontWeight: 'bold', color: 'white',
        margin: '0 auto 12px',
    },
    playerName: { margin: '0 0 8px', fontSize: 16, fontWeight: '600' },
    playerScore: { margin: 0, fontSize: 48, fontWeight: '900' },
    vs: { fontSize: 24, color: '#636e72', fontWeight: '900', flexShrink: 0, padding: '0 16px' },
    btn: {
        flex: 1, padding: '14px',
        background: 'linear-gradient(135deg, #e84393, #a855f7)',
        border: 'none', borderRadius: 12,
        color: 'white', fontSize: 16, fontWeight: 'bold', cursor: 'pointer',
    },
};
