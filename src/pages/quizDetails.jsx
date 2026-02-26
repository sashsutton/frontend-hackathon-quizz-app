import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

function QuizDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuizDetails = async () => {
            try {
                const token = await getToken();
                const response = await axios.get(`http://127.0.0.1:5000/quiz/page/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setQuiz(response.data.quiz);
            } catch (error) {
                console.error("Token not verified ", error);
            } finally {
                setLoading(false);
            }
        };
        if (isLoaded) fetchQuizDetails();
    }, [id, isLoaded, getToken]);

    const handleStart = () => {
        if (!isSignedIn) navigate('/sign-up');
        else navigate(`/play/${quiz._id || quiz.id}`);
    };

    if (loading) {
        return (
            <div className="retro-page">
                <div className="retro-spinner" />
                <p style={{ fontFamily: 'var(--font-hud)', color: 'var(--cyan)', marginTop: 24, letterSpacing: '0.15em', fontSize: 12 }}>
                    CHARGEMENT DU QUIZ...
                </p>
                <div style={{ marginTop: 16 }}>
                    <span className="retro-dot" />
                    <span className="retro-dot" />
                    <span className="retro-dot" />
                </div>
            </div>
        );
    }

    if (!quiz) return (
        <div className="retro-page">
            <p style={{ fontFamily: 'var(--font-pixel)', color: 'var(--magenta)', fontSize: 13 }}>QUIZ INTROUVABLE</p>
        </div>
    );

    const diffColor = { easy: 'var(--green)', medium: 'var(--yellow)', hard: 'var(--magenta)' }[quiz.difficulty?.toLowerCase()] || 'var(--cyan)';

    return (
        <div className="retro-page" style={{ alignItems: 'stretch', maxWidth: 700, margin: '0 auto', paddingTop: 80 }}>
            <div className="retro-card" style={{ width: '100%' }}>
                {/* Top badge row */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                    <span style={{
                        fontFamily: 'var(--font-hud)', fontSize: 10, letterSpacing: '0.15em',
                        color: 'var(--magenta)', border: '1px solid var(--magenta)',
                        padding: '3px 12px', textTransform: 'uppercase',
                        boxShadow: '0 0 8px rgba(255,0,255,0.25)',
                    }}>{quiz.category || 'GÉNÉRAL'}</span>
                    <span style={{
                        fontFamily: 'var(--font-hud)', fontSize: 10, letterSpacing: '0.15em',
                        color: diffColor, border: `1px solid ${diffColor}`,
                        padding: '3px 12px', textTransform: 'uppercase',
                        boxShadow: `0 0 8px ${diffColor}44`,
                    }}>{quiz.difficulty || 'MEDIUM'}</span>
                </div>

                {/* Title */}
                <h1 style={{
                    fontFamily: 'var(--font-pixel)', fontSize: 'clamp(14px, 2.5vw, 22px)',
                    color: 'var(--cyan)', textShadow: '0 0 12px var(--cyan)',
                    lineHeight: 1.8, marginBottom: 32,
                }}>
                    {quiz.title}
                </h1>

                {/* Info panel */}
                <div style={{
                    background: 'rgba(0,255,255,0.04)', border: '1px solid rgba(0,255,255,0.15)',
                    padding: '20px 24px', marginBottom: 32,
                }}>
                    <p style={{ color: 'var(--dim)', lineHeight: 1.9, marginBottom: 16, fontSize: 14 }}>
                        {quiz.description || 'Préparez-vous à relever ce défi !'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontFamily: 'var(--font-hud)', fontSize: 11, color: 'var(--cyan)', letterSpacing: '0.1em' }}>QUESTIONS :</span>
                        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 14, color: 'var(--yellow)', textShadow: '0 0 8px var(--yellow)' }}>
                            {quiz.questions ? quiz.questions.length : 0}
                        </span>
                    </div>
                </div>

                {/* Start button */}
                <button
                    onClick={handleStart}
                    className="retro-btn"
                    style={{ width: '100%', padding: '16px', fontSize: 13, letterSpacing: '0.2em' }}
                >
                    ▶ COMMENCER LE QUIZ
                </button>
            </div>
        </div>
    );
}

export default QuizDetailsPage;