import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { io } from 'socket.io-client';

const API = 'http://127.0.0.1:5000';

export default function DuelLobbyPage() {
    const { getToken, isLoaded } = useAuth();
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [tab, setTab] = useState('create');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [createdCode, setCreatedCode] = useState('');
    const [createdId, setCreatedId] = useState('');
    const socketRef = useRef(null);

    // Load quiz list
    useEffect(() => {
        if (!isLoaded) return;
        (async () => {
            try {
                const token = await getToken();
                const res = await axios.get(`${API}/quiz/get-all-quizzes`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setQuizzes(res.data ?? []);
            } catch (e) { console.error(e); }
        })();
    }, [isLoaded]);

    // Connect WebSocket and listen for duel:started event
    const connectSocket = (duelId) => {
        const socket = io(API, { transports: ['websocket'] });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[socket] connected', socket.id);
            socket.emit('duel:join_room', { duel_id: duelId });
        });

        socket.on('duel:started', (data) => {
            console.log('[socket] duel started', data);
            socket.disconnect();
            navigate(`/duel/play/${duelId}`);
        });

        socket.on('connect_error', (err) => {
            console.warn('[socket] connect error, falling back to poll', err);
        });
    };

    // Cleanup socket on unmount
    useEffect(() => {
        return () => { socketRef.current?.disconnect(); };
    }, []);

    const handleCreate = async () => {
        if (!selectedQuiz) { setError('CHOISISSEZ UN QUIZ.'); return; }
        setLoading(true); setError('');
        try {
            const token = await getToken();
            const res = await axios.post(`${API}/duel/create`, { quiz_id: selectedQuiz }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCreatedCode(res.data.room_code);
            setCreatedId(res.data.duel_id);
            connectSocket(res.data.duel_id);
        } catch (e) {
            setError(e.response?.data?.error ?? 'ERREUR DE CONNEXION.');
        } finally { setLoading(false); }
    };

    const handleJoin = async () => {
        if (!joinCode.trim()) { setError('ENTREZ UN CODE DE ROOM.'); return; }
        setLoading(true); setError('');
        try {
            const token = await getToken();
            const res = await axios.post(`${API}/duel/join/${joinCode.toUpperCase()}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const duelId = res.data.duel_id;

            // Connect to socket room, then navigate straight to game
            const socket = io(API, { transports: ['websocket'] });
            socketRef.current = socket;
            socket.on('connect', () => {
                socket.emit('duel:join_room', { duel_id: duelId });
                // Notify the room that player 2 joined
                socket.emit('duel:player_joined', {
                    duel_id: duelId,
                    player2_name: 'Joueur 2'
                });
                socket.disconnect();
            });
            navigate(`/duel/play/${duelId}`);
        } catch (e) {
            setError(e.response?.data?.error ?? 'CODE INVALIDE.');
        } finally { setLoading(false); }
    };

    return (
        <div className="retro-page">
            <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
            <div style={{ width: '100%', maxWidth: 560 }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <h1 className="retro-title" style={{ color: 'var(--magenta)', textShadow: '0 0 15px var(--magenta)', fontSize: 'clamp(16px, 3vw, 26px)' }}>
                        DUEL MODE
                    </h1>
                    <p className="retro-subtitle">— AFFRONTE UN ADVERSAIRE —</p>
                    <div style={{ width: 60, height: 2, background: 'var(--magenta)', margin: '20px auto 0', boxShadow: '0 0 10px var(--magenta)' }} />
                </div>

                <div style={{ display: 'flex', gap: 0, marginBottom: 24, border: '1px solid rgba(0,255,255,0.2)' }}>
                    {[['create', '◈ CRÉER'], ['join', '◉ REJOINDRE']].map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => { setTab(key); setError(''); setCreatedCode(''); if (socketRef.current) socketRef.current.disconnect(); }}
                            style={{
                                flex: 1, padding: '12px', cursor: 'pointer',
                                fontFamily: 'var(--font-hud)', fontSize: 11, letterSpacing: '0.1em',
                                border: 'none', borderRight: key === 'create' ? '1px solid rgba(0,255,255,0.2)' : 'none',
                                background: tab === key ? `rgba(${key === 'create' ? '255,0,255' : '0,255,255'},0.12)` : 'transparent',
                                color: tab === key ? (key === 'create' ? 'var(--magenta)' : 'var(--cyan)') : 'var(--dim)',
                                transition: 'all 0.15s',
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="retro-card" style={{ borderColor: tab === 'create' ? 'rgba(255,0,255,0.4)' : 'rgba(0,255,255,0.4)' }}>
                    {tab === 'create' && !createdCode && (
                        <>
                            <label className="retro-label">Sélectionner un quiz</label>
                            <select className="retro-select" style={{ marginBottom: 20 }} value={selectedQuiz} onChange={e => setSelectedQuiz(e.target.value)}>
                                <option value="">-- CHOISIR UN QUIZ --</option>
                                {quizzes.map(q => <option key={q._id} value={q._id}>{q.title}</option>)}
                            </select>
                            {error && <p style={{ fontFamily: 'var(--font-hud)', color: 'var(--magenta)', fontSize: 11, marginBottom: 16 }}>{error}</p>}
                            <button onClick={handleCreate} disabled={loading} className="retro-btn retro-btn-magenta" style={{ width: '100%', padding: 14, fontSize: 12, letterSpacing: '0.2em' }}>
                                {loading ? '... CRÉATION' : '⚔ CRÉER LE DUEL'}
                            </button>
                        </>
                    )}

                    {tab === 'create' && createdCode && (
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontFamily: 'var(--font-hud)', color: 'var(--dim)', fontSize: 11, letterSpacing: '0.1em', marginBottom: 20 }}>
                                CODE À PARTAGER :
                            </p>
                            <div style={{
                                fontFamily: 'var(--font-pixel)', fontSize: 'clamp(22px, 5vw, 36px)',
                                color: 'var(--cyan)', textShadow: '0 0 20px var(--cyan), 0 0 40px rgba(0,255,255,0.4)',
                                letterSpacing: '12px', border: '2px solid var(--cyan)', padding: '20px 32px',
                                boxShadow: '0 0 20px rgba(0,255,255,0.2), inset 0 0 20px rgba(0,255,255,0.05)',
                                marginBottom: 28,
                            }}>
                                {createdCode}
                            </div>
                            <p style={{ fontFamily: 'var(--font-hud)', color: 'var(--magenta)', fontSize: 11, letterSpacing: '0.1em', animation: 'blink 1.2s infinite' }}>
                                ▶ EN ATTENTE D'UN ADVERSAIRE...
                            </p>
                            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--dim)', fontSize: 11, marginTop: 8 }}>
                                Connexion WebSocket active — démarrage automatique
                            </p>
                        </div>
                    )}

                    {tab === 'join' && (
                        <>
                            <label className="retro-label">Code de room</label>
                            <input
                                type="text" placeholder="EX: AB12CD" maxLength={6}
                                value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                                className="retro-input"
                                style={{ marginBottom: 20, textAlign: 'center', fontSize: 24, letterSpacing: '8px', fontFamily: 'var(--font-pixel)' }}
                            />
                            {error && <p style={{ fontFamily: 'var(--font-hud)', color: 'var(--magenta)', fontSize: 11, marginBottom: 16 }}>{error}</p>}
                            <button onClick={handleJoin} disabled={loading} className="retro-btn" style={{ width: '100%', padding: 14, fontSize: 12, letterSpacing: '0.2em' }}>
                                {loading ? '... CONNEXION' : '▶ REJOINDRE'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
