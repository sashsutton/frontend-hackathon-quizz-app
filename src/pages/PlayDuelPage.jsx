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

    const [phase, setPhase] = useState('loading');
    const [quiz, setQuiz] = useState(null);
    const [qIndex, setQIndex] = useState(0);
    const [timer, setTimer] = useState(TIMER_SECONDS);

    const quizRef = useRef(null);
    const qIndexRef = useRef(0);
    const answersRef = useRef([]);
    const intervalRef = useRef(null);
    const hasStarted = useRef(false);

    const stopTimer = useCallback(() => {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }, []);

    useEffect(() => {
        if (!isLoaded || hasStarted.current) return;
        hasStarted.current = true;
        (async () => {
            try {
                const token = await getToken();
                const [duelRes] = await Promise.all([
                    axios.get(`${API}/duel/${duelId}`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                const d = duelRes.data.duel;
                const quizRes = await axios.get(`${API}/quiz/${d.quiz_id}`, { headers: { Authorization: `Bearer ${token}` } });
                const loadedQuiz = quizRes.data.quiz;
                quizRef.current = loadedQuiz;
                setQuiz(loadedQuiz);
                setPhase('playing');
            } catch (e) { console.error(e); setPhase('error'); }
        })();
    }, [isLoaded]);

    useEffect(() => {
        if (phase !== 'playing') return;
        stopTimer();
        setTimer(TIMER_SECONDS);
        let remaining = TIMER_SECONDS;
        intervalRef.current = setInterval(() => {
            remaining -= 1;
            setTimer(remaining);
            if (remaining <= 0) { stopTimer(); handleRecord(''); }
        }, 1000);
        return stopTimer;
    }, [phase, qIndex]); // eslint-disable-line

    const handleRecord = useCallback(async (selected) => {
        stopTimer();
        const q = quizRef.current?.questions[qIndexRef.current];
        if (!q) return;
        const entry = { question_id: q.id ?? String(qIndexRef.current), selected_option: selected, is_correct: false };
        const updated = [...answersRef.current, entry];
        answersRef.current = updated;
        const nextIndex = qIndexRef.current + 1;
        const questions = quizRef.current?.questions ?? [];
        if (nextIndex >= questions.length) {
            setPhase('submitting');
            try {
                const token = await getToken();
                const res = await axios.post(`${API}/duel/${duelId}/submit`, { answers: updated }, { headers: { Authorization: `Bearer ${token}` } });
                if (res.data.both_done) {
                    navigate(`/duel/result/${duelId}`);
                } else {
                    setPhase('waiting');
                    const poll = setInterval(async () => {
                        try {
                            const t = await getToken();
                            const r = await axios.get(`${API}/duel/${duelId}`, { headers: { Authorization: `Bearer ${t}` } });
                            if (r.data.duel?.status === 'finished') { clearInterval(poll); navigate(`/duel/result/${duelId}`); }
                        } catch (_) { }
                    }, 2000);
                }
            } catch (e) { console.error(e); navigate(`/duel/result/${duelId}`); }
        } else {
            qIndexRef.current = nextIndex;
            setQIndex(nextIndex);
        }
    }, [duelId, getToken, stopTimer, navigate]);

    const timerColor = timer <= 5 ? 'var(--magenta)' : timer <= 10 ? 'var(--yellow)' : 'var(--green)';
    const timerPct = (timer / TIMER_SECONDS) * 100;
    const currentQ = quiz?.questions[qIndex];

    if (phase === 'loading' || phase === 'error') return (
        <div className="retro-page">
            <div className="retro-spinner" />
            <p style={{ fontFamily: 'var(--font-hud)', color: 'var(--magenta)', marginTop: 24, letterSpacing: '0.15em', fontSize: 12 }}>
                {phase === 'error' ? 'ERREUR DE CONNEXION' : 'CHARGEMENT DU DUEL...'}
            </p>
        </div>
    );

    if (phase === 'submitting') return (
        <div className="retro-page">
            <p style={{ fontFamily: 'var(--font-pixel)', color: 'var(--cyan)', fontSize: 14 }}>ENVOI...</p>
        </div>
    );

    if (phase === 'waiting') return (
        <div className="retro-page">
            <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}`}</style>
            <p style={{ fontFamily: 'var(--font-pixel)', color: 'var(--green)', fontSize: 14, marginBottom: 24, textShadow: '0 0 12px var(--green)' }}>
                QUIZ TERMINÉ !
            </p>
            <p style={{ fontFamily: 'var(--font-hud)', color: 'var(--magenta)', fontSize: 12, letterSpacing: '0.15em', animation: 'blink 1.2s infinite' }}>
                EN ATTENTE DE L'ADVERSAIRE...
            </p>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', padding: '80px 20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="retro-card" style={{ width: '100%', maxWidth: 780, borderColor: 'var(--magenta)', boxShadow: '0 0 20px rgba(255,0,255,0.2)' }}>
                {/* HUD bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                    <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: 'var(--magenta)', textShadow: '0 0 8px var(--magenta)' }}>
                        ⚔ DUEL
                    </span>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 20, color: timerColor, textShadow: `0 0 12px ${timerColor}`, marginBottom: 6 }}>
                            {String(timer).padStart(2, '0')}
                        </div>
                        <div style={{ width: 120, height: 4, background: 'rgba(255,255,255,0.1)' }}>
                            <div style={{ width: `${timerPct}%`, height: '100%', background: timerColor, boxShadow: `0 0 8px ${timerColor}`, transition: 'width 1s linear' }} />
                        </div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-hud)', fontSize: 11, color: 'var(--cyan)', letterSpacing: '0.1em' }}>
                        Q{qIndex + 1}/{quiz?.questions?.length}
                    </span>
                </div>

                {/* Question */}
                {currentQ && (
                    <>
                        <p style={{
                            fontFamily: 'var(--font-mono)', fontSize: 17, lineHeight: 1.8,
                            color: 'var(--white)', marginBottom: 32,
                            borderLeft: '3px solid var(--cyan)', paddingLeft: 16,
                        }}>
                            {currentQ.text}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            {(currentQ.options ?? []).map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleRecord(opt)}
                                    style={{
                                        padding: '16px 20px', cursor: 'pointer',
                                        fontFamily: 'var(--font-mono)', fontSize: 14,
                                        color: 'var(--white)', textAlign: 'left',
                                        background: 'rgba(255,0,255,0.04)',
                                        border: '1px solid rgba(255,0,255,0.3)',
                                        transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'rgba(255,0,255,0.15)';
                                        e.currentTarget.style.borderColor = 'var(--magenta)';
                                        e.currentTarget.style.boxShadow = '0 0 15px rgba(255,0,255,0.3)';
                                        e.currentTarget.style.color = 'var(--magenta)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'rgba(255,0,255,0.04)';
                                        e.currentTarget.style.borderColor = 'rgba(255,0,255,0.3)';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.color = 'var(--white)';
                                    }}
                                >
                                    <span style={{ color: 'var(--magenta)', fontFamily: 'var(--font-pixel)', fontSize: 10, marginRight: 12 }}>
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
