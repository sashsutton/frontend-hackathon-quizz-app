import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

const API = 'http://127.0.0.1:5000';
const TIMER_SECONDS = 30;

export default function PlayDuelPage() {
    const { duelId } = useParams();
    const navigate = useNavigate();
    const { getToken, isLoaded } = useAuth();

    const [phase, setPhase] = useState('loading'); // loading|playing|submitting|waiting|finished
    const [duel, setDuel] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [qIndex, setQIndex] = useState(0);
    const [timer, setTimer] = useState(TIMER_SECONDS);
    const [myClerkId, setMyClerkId] = useState(null);

    const quizRef = useRef(null);
    const qIndexRef = useRef(0);
    const answersRef = useRef([]);
    const intervalRef = useRef(null);
    const hasStarted = useRef(false);
    const duelIdRef = useRef(duelId);

    const stopTimer = useCallback(() => {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }, []);

    // Load duel + quiz
    useEffect(() => {
        if (!isLoaded || hasStarted.current) return;
        hasStarted.current = true;
        (async () => {
            try {
                const token = await getToken();
                const [duelRes, meRes] = await Promise.all([
                    axios.get(`${API}/duel/${duelId}`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                const d = duelRes.data.duel;
                setDuel(d);
                setMyClerkId(meRes.data.clerk_id);
                const quizRes = await axios.get(`${API}/quiz/${d.quiz_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const loadedQuiz = quizRes.data.quiz;
                quizRef.current = loadedQuiz;
                setQuiz(loadedQuiz);
                setPhase('playing');
            } catch (e) {
                console.error(e);
                setPhase('error');
            }
        })();
    }, [isLoaded]);

    // Timer effect (re-runs when qIndex changes)
    useEffect(() => {
        if (phase !== 'playing') return;
        stopTimer();
        setTimer(TIMER_SECONDS);
        let remaining = TIMER_SECONDS;
        intervalRef.current = setInterval(() => {
            remaining -= 1;
            setTimer(remaining);
            if (remaining <= 0) {
                stopTimer();
                handleRecord('');
            }
        }, 1000);
        return stopTimer;
    }, [phase, qIndex]); // eslint-disable-line

    const handleRecord = useCallback(async (selected) => {
        stopTimer();
        const q = quizRef.current?.questions[qIndexRef.current];
        if (!q) return;
        const entry = {
            question_id: q.id ?? String(qIndexRef.current),
            selected_option: selected,
            is_correct: false,
        };
        const updated = [...answersRef.current, entry];
        answersRef.current = updated;

        const nextIndex = qIndexRef.current + 1;
        const questions = quizRef.current?.questions ?? [];

        if (nextIndex >= questions.length) {
            // Submit answers
            setPhase('submitting');
            try {
                const token = await getToken();
                const res = await axios.post(`${API}/duel/${duelId}/submit`, { answers: updated }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.both_done) {
                    navigate(`/duel/result/${duelId}`);
                } else {
                    setPhase('waiting');
                    // Poll for opponent
                    const poll = setInterval(async () => {
                        try {
                            const t = await getToken();
                            const r = await axios.get(`${API}/duel/${duelId}`, {
                                headers: { Authorization: `Bearer ${t}` }
                            });
                            if (r.data.duel?.status === 'finished') {
                                clearInterval(poll);
                                navigate(`/duel/result/${duelId}`);
                            }
                        } catch (_) { }
                    }, 2000);
                }
            } catch (e) {
                console.error(e);
                navigate(`/duel/result/${duelId}`);
            }
        } else {
            qIndexRef.current = nextIndex;
            setQIndex(nextIndex);
        }
    }, [duelId, getToken, stopTimer, navigate]);

    if (phase === 'loading') {
        return (
            <div style={sp.page}>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <div style={{ width: 70, height: 70, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #e84393', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: '#a29bfe', marginTop: 20 }}>Chargement du duel...</p>
            </div>
        );
    }

    if (phase === 'submitting') {
        return (
            <div style={sp.page}>
                <div style={sp.card}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📤</div>
                    <h2>Envoi de vos réponses...</h2>
                </div>
            </div>
        );
    }

    if (phase === 'waiting') {
        return (
            <div style={sp.page}>
                <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>
                <div style={sp.card}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                    <h2>Vous avez terminé !</h2>
                    <p style={{ color: '#a29bfe', animation: 'pulse 1.5s infinite' }}>
                        En attente que votre adversaire termine...
                    </p>
                </div>
            </div>
        );
    }

    const currentQ = quiz?.questions[qIndex];
    const timerColor = timer <= 5 ? '#e74c3c' : timer <= 10 ? '#f39c12' : '#e84393';
    const timerPct = (timer / TIMER_SECONDS) * 100;

    return (
        <div style={sp.page}>
            <div style={sp.card}>
                {/* Header */}
                <div style={sp.header}>
                    <span style={sp.tag}>⚔️ Duel</span>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 28, fontWeight: 'bold', color: timerColor }}>{timer}s</div>
                        <div style={{ width: 120, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginTop: 4 }}>
                            <div style={{ width: `${timerPct}%`, height: '100%', background: timerColor, borderRadius: 3, transition: 'width 1s linear' }} />
                        </div>
                    </div>
                    <span style={sp.tag}>Q {qIndex + 1}/{quiz?.questions?.length}</span>
                </div>

                {currentQ && (
                    <>
                        <h2 style={sp.question}>{currentQ.text}</h2>
                        <div style={sp.grid}>
                            {(currentQ.options ?? []).map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleRecord(opt)}
                                    style={sp.optBtn}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,67,147,0.25)'; e.currentTarget.style.borderColor = '#e84393'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                                >
                                    <span style={{ color: '#e84393', fontWeight: 'bold', marginRight: 10 }}>
                                        {String.fromCharCode(65 + i)}.
                                    </span>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

const sp = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: 'white',
    },
    card: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24, padding: 48,
        width: '100%', maxWidth: 760,
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
    tag: { color: '#e84393', fontWeight: '700', fontSize: 16 },
    question: { fontSize: 26, lineHeight: 1.5, marginBottom: 36 },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
    optBtn: {
        padding: '18px 20px', borderRadius: 14,
        border: '2px solid rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.07)',
        color: 'white', fontSize: 16, cursor: 'pointer',
        textAlign: 'left', transition: 'all 0.2s ease',
    },
};
