import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

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
    const [polling, setPolling] = useState(false);

    useEffect(() => {
        if (!isLoaded) return;
        (async () => {
            try {
                const token = await getToken();
                const res = await axios.get(`${API}/quiz/get-all-quizzes`, { headers: { Authorization: `Bearer ${token}` } });
                setQuizzes(res.data ?? []);
            } catch (e) { console.error(e); }
        })();
    }, [isLoaded]);

    useEffect(() => {
        if (!polling || !createdId) return;
        const interval = setInterval(async () => {
            try {
                const token = await getToken();
                const res = await axios.get(`${API}/duel/${createdId}`, { headers: { Authorization: `Bearer ${token}` } });
                if (res.data.duel?.status === 'in_battle') {
                    clearInterval(interval);
                    navigate(`/duel/play/${createdId}`);
                }
            } catch (e) { console.error(e); }
        }, 2000);
        return () => clearInterval(interval);
    }, [polling, createdId]);

    const handleCreate = async () => {
        if (!selectedQuiz) { setError('CHOISISSEZ UN QUIZ.'); return; }
        setLoading(true); setError('');
        try {
            const token = await getToken();
            const res = await axios.post(`${API}/duel/create`, { quiz_id: selectedQuiz }, { headers: { Authorization: `Bearer ${token}` } });
            setCreatedCode(res.data.room_code);
            setCreatedId(res.data.duel_id);
            setPolling(true);
        } catch (e) {
            setError(e.response?.data?.error ?? 'ERREUR DE CONNEXION.');
        } finally { setLoading(false); }
    };

    const handleJoin = async () => {
        if (!joinCode.trim()) { setError('ENTREZ UN CODE DE ROOM.'); return; }
        setLoading(true); setError('');
        try {
            const token = await getToken();
            const res = await axios.post(`${API}/duel/join/${joinCode.toUpperCase()}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            navigate(`/duel/play/${res.data.duel_id}`);
        } catch (e) {
            setError(e.response?.data?.error ?? 'CODE INVALIDE.');
        } finally { setLoading(false); }
    };

    return (
        <div className="retro-page">
            <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
            <div style={{ width: '100%', maxWidth: 560 }}>
                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <h1 className="retro-title" style={{ color: 'var(--magenta)', textShadow: '0 0 15px var(--magenta)', fontSize: 'clamp(16px, 3vw, 26px)' }}>
                        DUEL MODE
                    </h1>
                    <p className="retro-subtitle">— AFFRONTE UN ADVERSAIRE —</p>
                    <div style={{ width: 60, height: 2, background: 'var(--magenta)', margin: '20px auto 0', boxShadow: '0 0 10px var(--magenta)' }} />
                </div>

                {/* Tab buttons */}
                <div style={{ display: 'flex', gap: 0, marginBottom: 24, border: '1px solid rgba(0,255,255,0.2)' }}>
                    <button
                        onClick={() => { setTab('create'); setError(''); setCreatedCode(''); setPolling(false); }}
                        style={{
                            flex: 1, padding: '12px', cursor: 'pointer',
                            fontFamily: 'var(--font-hud)', fontSize: 11, letterSpacing: '0.1em',
                            border: 'none', borderRight: '1px solid rgba(0,255,255,0.2)',
                            background: tab === 'create' ? 'rgba(255,0,255,0.15)' : 'transparent',
                            color: tab === 'create' ? 'var(--magenta)' : 'var(--dim)',
                            transition: 'all 0.15s',
                        }}
                    >
                        ◈ CRÉER
                    </button>
                    <button
                        onClick={() => { setTab('join'); setError(''); }}
                        style={{
                            flex: 1, padding: '12px', cursor: 'pointer',
                            fontFamily: 'var(--font-hud)', fontSize: 11, letterSpacing: '0.1em',
                            border: 'none',
                            background: tab === 'join' ? 'rgba(0,255,255,0.1)' : 'transparent',
                            color: tab === 'join' ? 'var(--cyan)' : 'var(--dim)',
                            transition: 'all 0.15s',
                        }}
                    >
                        ◉ REJOINDRE
                    </button>
                </div>

                <div className="retro-card" style={{ borderColor: tab === 'create' ? 'rgba(255,0,255,0.4)' : 'rgba(0,255,255,0.4)' }}>
                    {tab === 'create' && !createdCode && (
                        <>
                            <label className="retro-label">Sélectionner un quiz</label>
                            <select
                                className="retro-select"
                                style={{ marginBottom: 20 }}
                                value={selectedQuiz}
                                onChange={e => setSelectedQuiz(e.target.value)}
                            >
                                <option value="">-- CHOISIR UN QUIZ --</option>
                                {quizzes.map(q => <option key={q._id} value={q._id}>{q.title}</option>)}
                            </select>
                            {error && <p style={{ fontFamily: 'var(--font-hud)', color: 'var(--magenta)', fontSize: 11, marginBottom: 16, letterSpacing: '0.05em' }}>{error}</p>}
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
                                fontFamily: 'var(--font-pixel)',
                                fontSize: 'clamp(22px, 5vw, 36px)',
                                color: 'var(--cyan)',
                                textShadow: '0 0 20px var(--cyan), 0 0 40px rgba(0,255,255,0.4)',
                                letterSpacing: '12px',
                                border: '2px solid var(--cyan)',
                                padding: '20px 32px',
                                boxShadow: '0 0 20px rgba(0,255,255,0.2), inset 0 0 20px rgba(0,255,255,0.05)',
                                marginBottom: 28,
                            }}>
                                {createdCode}
                            </div>
                            <p style={{ fontFamily: 'var(--font-hud)', color: 'var(--magenta)', fontSize: 11, letterSpacing: '0.1em', animation: 'blink 1.2s infinite' }}>
                                ▶ EN ATTENTE D'UN ADVERSAIRE...
                            </p>
                        </div>
                    )}

                    {tab === 'join' && (
                        <>
                            <label className="retro-label">Code de room</label>
                            <input
                                type="text"
                                placeholder="EX: AB12CD"
                                maxLength={6}
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value.toUpperCase())}
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
