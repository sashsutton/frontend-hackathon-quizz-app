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

    const [phase, setPhase] = useState("loading"); // loading | error | playing | submitting | finished
    const [quiz, setQuiz] = useState(null);
    const [qIndex, setQIndex] = useState(0);
    const [timer, setTimer] = useState(TIMER_SECONDS);
    const [score, setScore] = useState(0);
    const [details, setDetails] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");

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
            // Quiz terminé — soumettre
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
                console.error("Submit error:", e);
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

    // ─── Timer effect ────────────────────────────────────────────────────────────
    // Starts/restarts when phase===playing and qIndex changes
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
                recordAnswer(""); // timeout → empty answer
            }
        }, 1000);

        return stopTimer;
    }, [phase, qIndex]); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Load quiz ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isLoaded || hasStarted.current) return;
        hasStarted.current = true;

        (async () => {
            try {
                const token = await getToken();

                // 1. Créer la session solo
                const sessRes = await axios.post(
                    `${API}/quiz/soloquiz/${quizId}`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (!sessRes.data.success) throw new Error("Session creation failed");
                sessionId.current = sessRes.data.session_id;

                // 2. Charger le quiz (sans les bonnes réponses)
                const quizRes = await axios.get(
                    `${API}/quiz/${quizId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (!quizRes.data.success) throw new Error("Quiz load failed");

                const loadedQuiz = quizRes.data.quiz;
                console.log("Quiz loaded:", loadedQuiz);

                if (!loadedQuiz?.questions?.length) {
                    throw new Error("Ce quiz n'a pas de questions.");
                }

                quizRef.current = loadedQuiz;
                setQuiz(loadedQuiz);
                setPhase("playing");

            } catch (err) {
                console.error("Load error:", err);
                setErrorMsg(err.message || "Erreur lors du chargement.");
                setPhase("error");
            }
        })();
    }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Render ──────────────────────────────────────────────────────────────────

    const styles = {
        page: {
            minHeight: "100vh",
            background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            color: "white",
            padding: "20px",
        },
        card: {
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "24px",
            padding: "48px",
            width: "100%",
            maxWidth: "760px",
            boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
            textAlign: "center",
        },
    };

    if (phase === "loading") {
        return (
            <div style={styles.page}>
                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                    @keyframes pulse { 0%,100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
                    .dot { width: 12px; height: 12px; border-radius: 50%; background: #a29bfe; display: inline-block; margin: 0 6px; animation: pulse 1.2s ease-in-out infinite; }
                    .dot:nth-child(2) { animation-delay: 0.2s; }
                    .dot:nth-child(3) { animation-delay: 0.4s; }
                `}</style>
                <div style={styles.card}>
                    <div style={{
                        width: "80px", height: "80px", borderRadius: "50%",
                        border: "4px solid rgba(255,255,255,0.1)",
                        borderTop: "4px solid #a29bfe",
                        margin: "0 auto 28px",
                        animation: "spin 1s linear infinite"
                    }} />
                    <h2 style={{ fontSize: "22px", marginBottom: "8px", color: "white" }}>Préparation du quiz</h2>
                    <p style={{ color: "#a29bfe", marginBottom: "24px" }}>Chargement des questions en cours...</p>
                    <div>
                        <span className="dot" />
                        <span className="dot" />
                        <span className="dot" />
                    </div>
                </div>
            </div>
        );
    }

    if (phase === "error") {
        return (
            <div style={styles.page}>
                <div style={styles.card}>
                    <div style={{ fontSize: "48px", marginBottom: "20px" }}>❌</div>
                    <h2 style={{ color: "#e74c3c" }}>{errorMsg}</h2>
                    <button
                        onClick={() => navigate("/quiz-list")}
                        style={{ marginTop: "20px", padding: "12px 30px", borderRadius: "12px", border: "none", background: "#e74c3c", color: "white", fontSize: "16px", cursor: "pointer" }}
                    >
                        Retour à la liste
                    </button>
                </div>
            </div>
        );
    }

    if (phase === "submitting") {
        return (
            <div style={styles.page}>
                <div style={styles.card}>
                    <div style={{ fontSize: "48px", marginBottom: "20px" }}>📊</div>
                    <h2>Calcul de votre score...</h2>
                </div>
            </div>
        );
    }

    if (phase === "finished") {
        return (
            <div style={styles.page}>
                <div style={{ ...styles.card, maxWidth: "860px" }}>
                    <div style={{ fontSize: "64px", marginBottom: "10px" }}>🏆</div>
                    <h1 style={{ fontSize: "40px", color: "#f1c40f", marginBottom: "10px" }}>Quiz terminé !</h1>
                    <p style={{ fontSize: "22px", color: "#a29bfe", marginBottom: "5px" }}>Votre score final</p>
                    <p style={{ fontSize: "72px", fontWeight: "bold", color: "#2ecc71", margin: "10px 0 30px" }}>{score}</p>
                    <p style={{ color: "#a29bfe", marginBottom: "30px" }}>Merci d'avoir joué à « {quiz?.title} » !</p>

                    <div style={{ textAlign: "left", background: "rgba(0,0,0,0.2)", borderRadius: "16px", padding: "24px", marginBottom: "30px" }}>
                        <h3 style={{ color: "#a29bfe", marginBottom: "20px" }}>Détail des réponses :</h3>
                        {quiz?.questions?.map((q, idx) => {
                            const qId = String(q.id ?? idx);
                            const result = details?.find(r => String(r.question_id) === qId);
                            const ok = result?.is_correct;
                            return (
                                <div key={idx} style={{ marginBottom: "12px", padding: "14px 18px", borderLeft: `5px solid ${ok ? "#2ecc71" : "#e74c3c"}`, background: ok ? "rgba(46,204,113,0.08)" : "rgba(231,76,60,0.08)", borderRadius: "6px" }}>
                                    <p style={{ margin: "0 0 6px", fontWeight: "bold" }}>{idx + 1}. {q.text}</p>
                                    <p style={{ margin: 0, color: ok ? "#2ecc71" : "#e74c3c" }}>
                                        {result?.selected_option ? `Votre réponse : ${result.selected_option}` : "(Aucune réponse)"} {ok ? "✅" : "❌"}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => navigate("/quiz-list")}
                        style={{ padding: "14px 40px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #e84393, #a855f7)", color: "white", fontSize: "18px", fontWeight: "bold", cursor: "pointer" }}
                    >
                        Retour à la liste
                    </button>
                </div>
            </div>
        );
    }

    // ── phase === "playing" ──
    const currentQ = quiz?.questions[qIndex];
    const timerColor = timer <= 5 ? "#e74c3c" : timer <= 10 ? "#f39c12" : "#3498db";
    const timerPct = (timer / TIMER_SECONDS) * 100;

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                    <span style={{ color: "#a29bfe", fontSize: "16px", fontWeight: "600" }}>
                        Question {qIndex + 1} / {quiz?.questions?.length}
                    </span>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "28px", fontWeight: "bold", color: timerColor }}>{timer}s</div>
                        <div style={{ width: "120px", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", marginTop: "4px" }}>
                            <div style={{ width: `${timerPct}%`, height: "100%", background: timerColor, borderRadius: "3px", transition: "width 1s linear, background 0.3s" }} />
                        </div>
                    </div>
                    <span style={{ color: "#a29bfe", fontSize: "16px", fontWeight: "600" }}>
                        {quiz?.title}
                    </span>
                </div>

                {/* Question */}
                {currentQ ? (
                    <>
                        <h2 style={{ fontSize: "26px", lineHeight: "1.5", marginBottom: "36px", color: "white" }}>
                            {currentQ.text}
                        </h2>

                        {/* Options */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            {(currentQ.options ?? []).map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => recordAnswer(opt)}
                                    style={{
                                        padding: "18px 20px",
                                        borderRadius: "14px",
                                        border: "2px solid rgba(255,255,255,0.15)",
                                        background: "rgba(255,255,255,0.07)",
                                        color: "white",
                                        fontSize: "17px",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                        textAlign: "left",
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(52,152,219,0.3)"; e.currentTarget.style.borderColor = "#3498db"; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
                                >
                                    <span style={{ color: "#a29bfe", fontWeight: "bold", marginRight: "10px" }}>
                                        {String.fromCharCode(65 + i)}.
                                    </span>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <p>Question introuvable.</p>
                )}
            </div>
        </div>
    );
}

export default PlaySoloGamePage;