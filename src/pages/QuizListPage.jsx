import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

function QuizListPage() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getToken, isLoaded, isSignedIn } = useAuth();

    useEffect(() => {
        if (!isLoaded) return;

        const fetchQuizzes = async () => {
            try {
                const token = await getToken();
                const response = await axios.get('http://127.0.0.1:5000/quiz/get-all-quizzes', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
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

    const styles = {
        container: {
            padding: '60px 20px',
            backgroundColor: '#1a1a2e',
            minHeight: '100vh',
            color: 'white',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        },
        header: { marginBottom: '50px', textAlign: 'center' },
        title: { fontSize: '3.5rem', fontWeight: '800', marginBottom: '10px' },
        underline: {
            width: '60px', height: '4px', backgroundColor: '#e84393',
            margin: '20px auto', borderRadius: '2px'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px',
            maxWidth: '1200px',
            margin: '0 auto'
        },
        card: {
            padding: '40px',
            borderRadius: '20px',
            backgroundColor: '#16213e',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            border: '1px solid rgba(255,255,255,0.05)'
        },
        emptyState: {
            padding: '60px',
            textAlign: 'center',
            backgroundColor: '#16213e',
            borderRadius: '20px',
            border: '2px dashed #3498db',
            color: '#b2bec3',
            maxWidth: '600px',
            margin: '0 auto'
        }
    };
    if (loading) {
        return (
            <div style={{ ...styles.container, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                    @keyframes pulse { 0%,100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
                    .ql-dot { width: 12px; height: 12px; border-radius: 50%; background: #e84393; display: inline-block; margin: 0 6px; animation: pulse 1.2s ease-in-out infinite; }
                    .ql-dot:nth-child(2) { animation-delay: 0.2s; }
                    .ql-dot:nth-child(3) { animation-delay: 0.4s; }
                `}</style>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    border: '4px solid rgba(255,255,255,0.1)',
                    borderTop: '4px solid #e84393',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '28px'
                }} />
                <h2 style={{ fontSize: '22px', marginBottom: '8px', color: 'white' }}>Chargement des quiz</h2>
                <p style={{ color: '#a29bfe', marginBottom: '24px' }}>Récupération de la liste en cours...</p>
                <div>
                    <span className="ql-dot" />
                    <span className="ql-dot" />
                    <span className="ql-dot" />
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Liste de Quiz</h1>
                <p style={{ color: '#a29bfe', fontSize: '1.2rem' }}>Choisis un défi !</p>
                <div style={styles.underline}></div>
            </div>

            {quizzes.length === 0 ? (
                <div style={styles.emptyState}>
                    <p style={{ fontSize: '1.2rem' }}>Pas de quiz disponible pour le moment.</p>
                </div>
            ) : (
                <div style={styles.grid}>
                    {quizzes.map((quiz) => (
                        <div
                            key={quiz._id}
                            style={styles.card}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-10px)';
                                e.currentTarget.style.boxShadow = '0 0 20px rgba(52, 152, 219, 0.4)';
                                e.currentTarget.style.borderColor = '#3498db';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                            }}
                        >
                            <div style={{ marginBottom: '20px' }}>
                                <h2 style={{ color: 'white', fontSize: '26px', fontWeight: '700', marginBottom: '10px' }}>
                                    {quiz.title}
                                </h2>
                                <span style={{ color: '#a29bfe', fontSize: '14px', fontWeight: '600' }}>
                                    Catégorie : <strong style={{ color: '#e84393' }}>{quiz.category}</strong>
                                </span>
                            </div>

                            <p style={{ color: '#b2bec3', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
                                {quiz.description || "Préparez-vous à relever ce défi passionnant !"}
                            </p>

                            <Link
                                to={`/quiz-details/${quiz._id}`}
                                style={{
                                    backgroundColor: '#3498db',
                                    color: 'white',
                                    padding: '12px 35px',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    fontWeight: 'bold',
                                    fontSize: '16px',
                                    transition: 'background 0.3s ease',
                                    boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
                            >
                                Voir le Quiz
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default QuizListPage;