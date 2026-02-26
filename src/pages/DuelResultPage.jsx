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

    if (loading) return (
        <div className="retro-page">
            <div className="retro-spinner" />
        </div>
    );

    if (!duel) return (
        <div className="retro-page">
            <p style={{ fontFamily: 'var(--font-pixel)', color: 'var(--magenta)', fontSize: 13 }}>DUEL INTROUVABLE</p>
        </div>
    );

    const isPlayer1 = duel.player1_id === myClerkId;
    const myScore = isPlayer1 ? duel.player1_score : duel.player2_score;
    const opponentScore = isPlayer1 ? duel.player2_score : duel.player1_score;
    const myName = isPlayer1 ? duel.player1_name : duel.player2_name;
    const opponentName = isPlayer1 ? duel.player2_name : duel.player1_name;
    const won = duel.winner_id === myClerkId;
    const draw = !duel.winner_id && duel.status === 'finished';

    const result = won ? { text: 'VICTORY', color: 'var(--green)', elo: '+20' }
        : draw ? { text: 'DRAW', color: 'var(--yellow)', elo: '±0' }
            : { text: 'DEFEAT', color: 'var(--magenta)', elo: '-20' };

    return (
        <div className="retro-page" style={{ paddingTop: 80 }}>
            <div style={{ width: '100%', maxWidth: 600 }}>
                {/* Result banner */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <p style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(28px, 5vw, 52px)', color: result.color, textShadow: `0 0 20px ${result.color}, 0 0 60px ${result.color}66`, marginBottom: 12 }}>
                        {result.text}
                    </p>
                    <p style={{ fontFamily: 'var(--font-hud)', color: 'var(--dim)', fontSize: 13, letterSpacing: '0.1em' }}>
                        ELO : <span style={{ color: result.color, textShadow: `0 0 8px ${result.color}` }}>{result.elo}</span>
                    </p>
                </div>

                {/* Scoreboard */}
                <div className="retro-card" style={{ marginBottom: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 16 }}>
                        {/* Me */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: 60, height: 60, margin: '0 auto 12px',
                                border: `2px solid ${won ? 'var(--green)' : 'var(--dim)'}`,
                                boxShadow: won ? '0 0 15px var(--green)' : 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'var(--font-pixel)', fontSize: 24,
                                color: won ? 'var(--green)' : 'var(--dim)',
                            }}>
                                {(myName?.[0] ?? '?').toUpperCase()}
                            </div>
                            <p style={{ fontFamily: 'var(--font-hud)', fontSize: 12, color: 'var(--cyan)', marginBottom: 8 }}>
                                {myName ?? 'VOUS'}
                                <span style={{ fontSize: 9, color: 'var(--dim)', display: 'block' }}>[YOU]</span>
                            </p>
                            <p style={{ fontFamily: 'var(--font-pixel)', fontSize: 36, color: won ? 'var(--green)' : 'var(--white)', textShadow: won ? '0 0 15px var(--green)' : 'none' }}>
                                {myScore}
                            </p>
                        </div>

                        {/* VS */}
                        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 18, color: 'var(--magenta)', textShadow: '0 0 10px var(--magenta)', textAlign: 'center' }}>
                            VS
                        </div>

                        {/* Opponent */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: 60, height: 60, margin: '0 auto 12px',
                                border: `2px solid ${!won && !draw ? 'var(--green)' : 'var(--dim)'}`,
                                boxShadow: !won && !draw ? '0 0 15px var(--green)' : 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'var(--font-pixel)', fontSize: 24,
                                color: !won && !draw ? 'var(--green)' : 'var(--dim)',
                            }}>
                                {(opponentName?.[0] ?? '?').toUpperCase()}
                            </div>
                            <p style={{ fontFamily: 'var(--font-hud)', fontSize: 12, color: 'var(--dim)', marginBottom: 8 }}>
                                {opponentName ?? 'ADVERSAIRE'}
                            </p>
                            <p style={{ fontFamily: 'var(--font-pixel)', fontSize: 36, color: !won && !draw ? 'var(--green)' : 'var(--dim)' }}>
                                {opponentScore}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 16 }}>
                    <button onClick={() => navigate('/duel')} className="retro-btn retro-btn-magenta" style={{ flex: 1, padding: 14, fontSize: 11, letterSpacing: '0.15em' }}>
                        ⚔ NOUVEAU DUEL
                    </button>
                    <button onClick={() => navigate('/leaderboard')} className="retro-btn" style={{ flex: 1, padding: 14, fontSize: 11, letterSpacing: '0.15em' }}>
                        ▶ CLASSEMENT
                    </button>
                </div>
            </div>
        </div>
    );
}
