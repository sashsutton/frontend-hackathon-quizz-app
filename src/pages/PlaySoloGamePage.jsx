import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

const TIMER_SECONDS = 30;
const API = "http://127.0.0.1:5000";

function PlaySoloGamePage() {
    const { id: quizId } = useParams();
    const navigate = useNavigate();
    const { getToken, isLoaded } = useAuth();

    const [phase, setPhase] = useState("loading"); // loading | blocked | error | playing | submitting | finished
    const [quiz, setQuiz] = useState(null);
    const [qIndex, setQIndex] = useState(0);
    const [timer, setTimer] = useState(TIMER_SECONDS);
    const [score, setScore] = useState(0);
    const [details, setDetails] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");
    const [isResume, setIsResume] = useState(false);

    // Refs so callbacks always have fresh values
    const sessionId = useRef(null);
    const answersRef = useRef([]);
    const qIndexRef = useRef(0);
    const quizRef = useRef(null);
    const intervalRef = useRef(null);
    const hasStarted = useRef(false);

    // ─── helpers ────────────────────────────────────────────────────────────────

    const stopTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const goNext = useCallback(async (answers) => {
        const nextIndex = qIndexRef.current + 1;
        const questions = quizRef.current?.questions ?? [];

        if (nextIndex >= questions.length) {
            stopTimer();
            setPhase("submitting");
            try {
                const token = await getToken();
                const res = await axios.post(`${API}/quiz/submit-solo`, {
                    session_id: sessionId.current,
                    quiz_id: quizId,
                    answers,
                }, { headers: { Authorization: `Bearer ${token}` } });
                setScore(res.data.score ?? 0);
                setDetails(res.data.details ?? []);
            } catch (e) {
                console.error("[SUBMIT] Error:", e.response?.data ?? e.message);
            }
            setPhase("finished");
        } else {
            qIndexRef.current = nextIndex;
            setQIndex(nextIndex);
            setTimer(TIMER_SECONDS);
        }
    }, [getToken, quizId, stopTimer]);

    const recordAnswer = useCallback(async (selected) => {
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
        await goNext(updated);
    }, [goNext, stopTimer]);



    useEffect(() => {
        if (phase !== "playing") return;

        stopTimer();
        setTimer(TIMER_SECONDS);

        let remaining = TIMER_SECONDS;
        intervalRef.current = setInterval(() => {
            remaining -= 1;
            setTimer(remaining);
            if (remaining <= 0) {
                stopTimer();
                recordAnswer("");
            }
        }, 1000);

        return stopTimer;
    }, [phase, qIndex]);

    // ─── Load quiz ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isLoaded || hasStarted.current) return;
        hasStarted.current = true;

        (async () => {
            try {
                const token = await getToken();


                const sessRes = await axios.post(
                    `${API}/quiz/soloquiz/${quizId}`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                ).catch(err => err.response);

                if (!sessRes || !sessRes.data) throw new Error("Erreur de connexion au serveur.");

                const { status, session_id } = sessRes.data;

                if (status === 'finished') {

                    setPhase('blocked');
                    return;
                }

                if (status === 'in_progress') {

                    sessionId.current = session_id;
                    setIsResume(true);
                } else {

                    sessionId.current = sessRes.data.session_id;
                }


                const quizRes = await axios.get(
                    `${API}/quiz/${quizId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (!quizRes.data.success) throw new Error("Quiz introuvable.");

                const loadedQuiz = quizRes.data.quiz;
                if (!loadedQuiz?.questions?.length) throw new Error("Ce quiz n'a pas de questions.");

                quizRef.current = loadedQuiz;
                setQuiz(loadedQuiz);
                setPhase('playing');

            } catch (err) {
                setErrorMsg(err.message || "Erreur lors du chargement.");
                setPhase('error');
            }
        })();
    }, [isLoaded]);




    const pageStyle = {
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '80px 20px 40px',
        fontFamily: "var(--font-mono)",
        color: "var(--white)",
    };
    const cardStyle = {
        background: 'rgba(0,0,20,0.85)',
        border: '2px solid var(--cyan)',
        boxShadow: '0 0 25px rgba(0,255,255,0.15), inset 0 0 30px rgba(0,255,255,0.03)',
        padding: '40px 48px',
        width: '100%', maxWidth: '780px',
        textAlign: 'center',
    };

    if (phase === "loading") {
        return (
            <div style={pageStyle}>
                <div style={cardStyle}>
                    <div className="retro-spinner" style={{ margin: '0 auto 28px' }} />
                    <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: 13, color: 'var(--cyan)', textShadow: '0 0 10px var(--cyan)', marginBottom: 16 }}>CHARGEMENT...</h2>
                    <p style={{ color: 'var(--dim)', fontSize: 12, fontFamily: 'var(--font-hud)', letterSpacing: '0.1em', marginBottom: 20 }}>PRÉPARATION DU QUIZ</p>
                    <div><span className="retro-dot" /><span className="retro-dot" /><span className="retro-dot" /></div>
                </div>
            </div>
        );
    }

    if (phase === "blocked") {
        return (
            <div style={pageStyle}>
                <div style={cardStyle}>
                    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 48, color: 'var(--magenta)', textShadow: '0 0 20px var(--magenta)', marginBottom: 24 }}>
                        🔒
                    </div>
                    <p style={{ fontFamily: 'var(--font-pixel)', fontSize: 13, color: 'var(--magenta)', textShadow: '0 0 12px var(--magenta)', marginBottom: 12 }}>
                        ACCÈS BLOQUÉ
                    </p>
                    <p style={{ fontFamily: 'var(--font-hud)', color: 'var(--dim)', fontSize: 12, letterSpacing: '0.08em', lineHeight: 1.8, marginBottom: 32 }}>
                        Vous avez déjà complété ce quiz.<br />
                        Chaque quiz ne peut être joué qu'une seule fois en solo.
                    </p>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => navigate('/quiz-list')} className="retro-btn retro-btn-magenta" style={{ fontSize: 11, letterSpacing: '0.15em', padding: '12px 28px' }}>
                            ◀ AUTRE QUIZ
                        </button>
                        <button onClick={() => navigate('/leaderboard')} className="retro-btn" style={{ fontSize: 11, letterSpacing: '0.15em', padding: '12px 28px' }}>
                            ▶ CLASSEMENT
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (phase === "error") {
        return (
            <div style={pageStyle}>
                <div style={cardStyle}>
                    <p style={{ fontFamily: 'var(--font-pixel)', fontSize: 13, color: 'var(--magenta)', textShadow: '0 0 10px var(--magenta)', marginBottom: 24 }}>ERREUR</p>
                    <p style={{ color: 'var(--dim)', fontFamily: 'var(--font-hud)', fontSize: 12, marginBottom: 28 }}>{errorMsg}</p>
                    <button onClick={() => navigate("/quiz-list")} className="retro-btn retro-btn-magenta" style={{ fontSize: 11, letterSpacing: '0.15em' }}>
                        ◀ RETOUR
                    </button>
                </div>
            </div>
        );
    }

    if (phase === "submitting") {
        return (
            <div style={pageStyle}>
                <div style={cardStyle}>
                    <div className="retro-spinner" style={{ margin: '0 auto 20px' }} />
                    <p style={{ fontFamily: 'var(--font-hud)', color: 'var(--cyan)', fontSize: 12, letterSpacing: '0.15em' }}>CALCUL DU SCORE...</p>
                </div>
            </div>
        );
    }

    if (phase === "finished") {
        return (
            <div style={pageStyle}>
                <div style={{ ...cardStyle, maxWidth: '860px' }}>
                    <p style={{ fontFamily: 'var(--font-pixel)', fontSize: 13, color: 'var(--yellow)', textShadow: '0 0 15px var(--yellow)', marginBottom: 12 }}>QUIZ TERMINÉ</p>
                    <p style={{ fontFamily: 'var(--font-hud)', fontSize: 11, color: 'var(--dim)', letterSpacing: '0.1em', marginBottom: 4 }}>SCORE FINAL</p>
                    <p style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(40px, 8vw, 72px)', color: 'var(--green)', textShadow: '0 0 20px var(--green)', margin: '10px 0 24px' }}>{score}</p>
                    <p style={{ color: 'var(--dim)', fontFamily: 'var(--font-hud)', fontSize: 12, marginBottom: 32, letterSpacing: '0.05em' }}>{quiz?.title}</p>

                    <div style={{ textAlign: 'left', border: '1px solid rgba(0,255,255,0.15)', background: 'rgba(0,255,255,0.03)', padding: '20px 24px', marginBottom: 28 }}>
                        <p style={{ fontFamily: 'var(--font-hud)', fontSize: 11, color: 'var(--cyan)', letterSpacing: '0.1em', marginBottom: 16 }}>DÉTAIL DES RÉPONSES</p>
                        {quiz?.questions?.map((q, idx) => {
                            const qId = String(q.id ?? idx);
                            const result = details?.find(r => String(r.question_id) === qId);
                            const ok = result?.is_correct;
                            return (
                                <div key={idx} style={{ marginBottom: 10, padding: '12px 16px', borderLeft: `3px solid ${ok ? 'var(--green)' : 'var(--magenta)'}`, background: ok ? 'rgba(0,255,65,0.06)' : 'rgba(255,0,255,0.06)' }}>
                                    <p style={{ margin: '0 0 6px', fontFamily: 'var(--font-hud)', fontSize: 12, color: 'var(--white)', letterSpacing: '0.02em' }}>{idx + 1}. {q.text}</p>
                                    <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 13, color: ok ? 'var(--green)' : 'var(--magenta)' }}>
                                        {result?.selected_option ? `▶ ${result.selected_option}` : '(AUCUNE RÉPONSE)'} {ok ? '✓' : '✗'}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <button onClick={() => navigate('/quiz-list')} className="retro-btn" style={{ fontSize: 11, letterSpacing: '0.15em', padding: '14px 40px' }}>
                        ◀ RETOUR AUX QUIZ
                    </button>
                </div>
            </div>
        );
    }


    const currentQ = quiz?.questions[qIndex];
    const timerColor = timer <= 5 ? 'var(--magenta)' : timer <= 10 ? 'var(--yellow)' : 'var(--cyan)';
    const timerPct = (timer / TIMER_SECONDS) * 100;

    return (
        <div style={pageStyle}>
            <div style={cardStyle}>
                {/* HUD bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <span style={{ fontFamily: 'var(--font-hud)', fontSize: 11, color: 'var(--cyan)', letterSpacing: '0.1em' }}>
                        Q{qIndex + 1}/{quiz?.questions?.length}
                    </span>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 22, color: timerColor, textShadow: `0 0 12px ${timerColor}`, marginBottom: 6 }}>
                            {String(timer).padStart(2, '0')}
                        </div>
                        <div style={{ width: 120, height: 4, background: 'rgba(255,255,255,0.1)' }}>
                            <div style={{ width: `${timerPct}%`, height: '100%', background: timerColor, boxShadow: `0 0 8px ${timerColor}`, transition: 'width 1s linear' }} />
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontFamily: 'var(--font-hud)', fontSize: 11, color: 'var(--dim)', letterSpacing: '0.05em' }}>
                            SOLO
                        </span>
                        {isResume && (
                            <div style={{ fontFamily: 'var(--font-hud)', fontSize: 9, color: 'var(--yellow)', letterSpacing: '0.1em', marginTop: 4, border: '1px solid var(--yellow)', padding: '2px 6px', display: 'inline-block' }}>
                                ▶ REPRISE
                            </div>
                        )}
                    </div>
                </div>

                {currentQ ? (
                    <>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 18, lineHeight: 1.8, color: 'var(--white)', marginBottom: 36, textAlign: 'left', borderLeft: '3px solid var(--cyan)', paddingLeft: 16 }}>
                            {currentQ.text}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            {(currentQ.options ?? []).map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => recordAnswer(opt)}
                                    style={{ padding: '16px 20px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--white)', textAlign: 'left', background: 'rgba(0,255,255,0.04)', border: '1px solid rgba(0,255,255,0.25)', transition: 'all 0.15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,255,0.15)'; e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(0,255,255,0.3)'; e.currentTarget.style.color = 'var(--cyan)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(0,255,255,0.25)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.color = 'var(--white)'; }}
                                >
                                    <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: 'var(--cyan)', marginRight: 12 }}>{String.fromCharCode(65 + i)}.</span>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </>
                ) : <p>Question introuvable.</p>}
            </div>
        </div>
    );
}

export default PlaySoloGamePage;