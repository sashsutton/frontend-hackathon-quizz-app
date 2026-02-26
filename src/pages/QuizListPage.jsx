import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

function QuizListPage() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getToken, isLoaded } = useAuth();

    useEffect(() => {
        if (!isLoaded) return;
        const fetchQuizzes = async () => {
            try {
                const token = await getToken();
                const response = await axios.get('http://127.0.0.1:5000/quiz/get-all-quizzes', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setQuizzes(response.data);
            } catch (error) {
                console.error("Erreur serveur :", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, [isLoaded]);

    if (loading) {
        return (
            <div className="retro-page">
                <div className="retro-spinner" />
                <p style={{ fontFamily: 'var(--font-hud)', color: 'var(--cyan)', marginTop: 24, fontSize: 13, letterSpacing: '0.1em' }}>
                    CHARGEMENT...
                </p>
                <div style={{ marginTop: 20 }}>
                    <span className="retro-dot" />
                    <span className="retro-dot" />
                    <span className="retro-dot" />
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', padding: '80px 40px 60px', maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
                <h1 className="retro-title" style={{ fontSize: 'clamp(18px, 3vw, 32px)', marginBottom: 16 }}>
                    QUIZ ARCADE
                </h1>
                <p className="retro-subtitle">— CHOISISSEZ VOTRE DÉFI —</p>
                <div style={{ width: 80, height: 2, background: 'var(--magenta)', margin: '20px auto 0', boxShadow: '0 0 10px var(--magenta)' }} />
            </div>

            {quizzes.length === 0 ? (
                <div className="retro-card" style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center', borderColor: 'var(--magenta)' }}>
                    <p style={{ fontFamily: 'var(--font-hud)', color: 'var(--magenta)', fontSize: 14, letterSpacing: '0.1em' }}>
                        AUCUN QUIZ DISPONIBLE
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 28 }}>
                    {quizzes.map((quiz) => (
                        <div
                            key={quiz._id}
                            className="retro-card quiz-card"
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', borderColor: 'rgba(0,255,255,0.25)' }}
                        >
                            {/* Category badge */}
                            <span style={{
                                fontFamily: 'var(--font-hud)', fontSize: 10, letterSpacing: '0.15em',
                                color: 'var(--magenta)', border: '1px solid var(--magenta)',
                                padding: '3px 10px', marginBottom: 16,
                                textTransform: 'uppercase',
                                boxShadow: '0 0 8px rgba(255,0,255,0.2)',
                            }}>
                                {quiz.category || 'GÉNÉRAL'}
                            </span>

                            <h2 style={{
                                fontFamily: 'var(--font-pixel)', fontSize: 14, color: 'var(--cyan)',
                                textShadow: '0 0 8px var(--cyan)', lineHeight: 1.8,
                                marginBottom: 12, flexGrow: 1,
                            }}>
                                {quiz.title}
                            </h2>

                            <p style={{ color: 'var(--dim)', fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>
                                {quiz.description || 'Préparez-vous pour ce défi !'}
                            </p>

                            <Link
                                to={`/quiz-details/${quiz._id}`}
                                className="retro-btn"
                                style={{ textDecoration: 'none', display: 'inline-block' }}
                            >
                                ▶ JOUER
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default QuizListPage;