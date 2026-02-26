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
    const [tab, setTab] = useState('create'); // 'create' | 'join'
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
                const res = await axios.get(`${API}/quiz/get-all-quizzes`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setQuizzes(res.data ?? []);
            } catch (e) { console.error(e); }
        })();
    }, [isLoaded]);

    // Poll for opponent joining
    useEffect(() => {
        if (!polling || !createdId) return;
        const interval = setInterval(async () => {
            try {
                const token = await getToken();
                const res = await axios.get(`${API}/duel/${createdId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.duel?.status === 'in_battle') {
                    clearInterval(interval);
                    navigate(`/duel/play/${createdId}`);
                }
            } catch (e) { console.error(e); }
        }, 2000);
        return () => clearInterval(interval);
    }, [polling, createdId]);

    const handleCreate = async () => {
        if (!selectedQuiz) { setError('Choisissez un quiz.'); return; }
        setLoading(true); setError('');
        try {
            const token = await getToken();
            const res = await axios.post(`${API}/duel/create`, { quiz_id: selectedQuiz }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCreatedCode(res.data.room_code);
            setCreatedId(res.data.duel_id);
            setPolling(true);
        } catch (e) {
            setError(e.response?.data?.error ?? 'Erreur lors de la création.');
        } finally { setLoading(false); }
    };

    const handleJoin = async () => {
        if (!joinCode.trim()) { setError('Entrez un code de room.'); return; }
        setLoading(true); setError('');
        try {
            const token = await getToken();
            const res = await axios.post(`${API}/duel/join/${joinCode.toUpperCase()}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate(`/duel/play/${res.data.duel_id}`);
        } catch (e) {
            setError(e.response?.data?.error ?? 'Code invalide ou duel introuvable.');
        } finally { setLoading(false); }
    };

    return (
        <div style={s.page}>
            <style>{`@keyframes pulse2 { 0%,100%{opacity:0.4} 50%{opacity:1} }`}</style>
            <div style={s.container}>
                <div style={s.header}>
                    <h1 style={s.title}>⚔️ Mode Duel</h1>
                    <p style={s.sub}>Affronte un autre joueur en temps réel</p>
                    <div style={s.underline} />
                </div>

                {/* Tabs */}
                <div style={s.tabs}>
                    <button onClick={() => { setTab('create'); setError(''); setCreatedCode(''); setPolling(false); }}
                        style={{ ...s.tab, ...(tab === 'create' ? s.tabActive : {}) }}>
                        🆕 Créer un duel
                    </button>
                    <button onClick={() => { setTab('join'); setError(''); }}
                        style={{ ...s.tab, ...(tab === 'join' ? s.tabActive : {}) }}>
                        🔗 Rejoindre un duel
                    </button>
                </div>

                <div style={s.card}>
                    {tab === 'create' && !createdCode && (
                        <>
                            <h2 style={s.cardTitle}>Choisir un quiz</h2>
                            <select style={s.select} value={selectedQuiz} onChange={e => setSelectedQuiz(e.target.value)}>
                                <option value="">-- Sélectionner un quiz --</option>
                                {quizzes.map(q => <option key={q._id} value={q._id}>{q.title}</option>)}
                            </select>
                            {error && <p style={s.err}>{error}</p>}
                            <button onClick={handleCreate} disabled={loading} style={s.btn}>
                                {loading ? '⏳ Création...' : '⚔️ Créer le duel'}
                            </button>
                        </>
                    )}

                    {tab === 'create' && createdCode && (
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: '#a29bfe', marginBottom: '16px' }}>Partagez ce code à votre adversaire :</p>
                            <div style={s.codeBox}>{createdCode}</div>
                            <p style={{ color: '#a29bfe', marginTop: '24px', animation: 'pulse2 1.5s infinite' }}>
                                ⏳ En attente d'un adversaire...
                            </p>
                            <p style={{ color: '#636e72', fontSize: '13px', marginTop: '8px' }}>
                                Le duel démarrera automatiquement quand quelqu'un rejoindra.
                            </p>
                        </div>
                    )}

                    {tab === 'join' && (
                        <>
                            <h2 style={s.cardTitle}>Entrer le code de room</h2>
                            <input
                                type="text"
                                placeholder="Ex: AB12CD"
                                maxLength={6}
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                                style={s.input}
                            />
                            {error && <p style={s.err}>{error}</p>}
                            <button onClick={handleJoin} disabled={loading} style={s.btn}>
                                {loading ? '⏳ Connexion...' : '🚀 Rejoindre'}
                            </button>
                        </>
                    )}
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
        padding: '40px 20px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: 'white',
    },
    container: { width: '100%', maxWidth: '560px' },
    header: { textAlign: 'center', marginBottom: '32px' },
    title: { fontSize: '2.2rem', fontWeight: '800', margin: '0 0 8px' },
    sub: { color: '#a29bfe', margin: '0 0 16px' },
    underline: { width: '50px', height: '4px', background: '#e84393', margin: '0 auto', borderRadius: '2px' },
    tabs: { display: 'flex', gap: '12px', marginBottom: '24px' },
    tab: {
        flex: 1, padding: '12px', borderRadius: '12px',
        border: '2px solid rgba(255,255,255,0.15)', background: 'transparent',
        color: '#a29bfe', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
    },
    tabActive: { background: 'rgba(232,67,147,0.2)', borderColor: '#e84393', color: 'white' },
    card: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px', padding: '36px',
    },
    cardTitle: { margin: '0 0 20px', fontSize: '20px', color: 'white' },
    select: {
        width: '100%', padding: '12px 16px', marginBottom: '16px',
        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '10px', color: 'white', fontSize: '16px',
    },
    input: {
        width: '100%', padding: '14px 16px', marginBottom: '16px', boxSizing: 'border-box',
        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '10px', color: 'white', fontSize: '22px', letterSpacing: '6px',
        textAlign: 'center', fontWeight: 'bold',
    },
    btn: {
        width: '100%', padding: '14px',
        background: 'linear-gradient(135deg, #e84393, #a855f7)',
        border: 'none', borderRadius: '12px',
        color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
    },
    err: { color: '#e74c3c', fontSize: '14px', margin: '-8px 0 12px' },
    codeBox: {
        display: 'inline-block',
        background: 'rgba(255,255,255,0.08)',
        border: '2px solid #e84393',
        borderRadius: '16px',
        padding: '20px 48px',
        fontSize: '40px',
        fontWeight: '900',
        letterSpacing: '12px',
        color: 'white',
    },
};
