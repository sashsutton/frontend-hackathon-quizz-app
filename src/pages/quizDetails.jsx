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
        if (!isSignedIn) {
            navigate('/sign-up');
        } else {
            navigate(`/play/${quiz._id || quiz.id}`);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                    @keyframes pulse { 0%,100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
                    .qd-dot { width: 12px; height: 12px; border-radius: 50%; background: #3498db; display: inline-block; margin: 0 6px; animation: pulse 1.2s ease-in-out infinite; }
                    .qd-dot:nth-child(2) { animation-delay: 0.2s; }
                    .qd-dot:nth-child(3) { animation-delay: 0.4s; }
                `}</style>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', border: '4px solid #e0e0e0', borderTop: '4px solid #3498db', animation: 'spin 1s linear infinite', marginBottom: '24px' }} />
                <h2 style={{ color: '#2c3e50', fontSize: '20px', marginBottom: '8px' }}>Chargement du quiz</h2>
                <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>Récupération des détails...</p>
                <div><span className="qd-dot" /><span className="qd-dot" /><span className="qd-dot" /></div>
            </div>
        );
    }

    if (!quiz) return <div style={{ textAlign: 'center', padding: '50px' }}>Quiz introuvable</div>;

    return (
        <div style={{ padding: '40px', maxWidth: '700px', margin: '40px auto', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <h1 style={{ color: '#2c3e50', fontSize: '32px', marginBottom: '10px' }}>{quiz.title}</h1>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
                <span style={{ backgroundColor: '#e1f5fe', color: '#039be5', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold' }}>
                    {quiz.category}
                </span>
                <span style={{ backgroundColor: '#fff3e0', color: '#ef6c00', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold' }}>
                    {quiz.difficulty || 'Moyen'}
                </span>
            </div>

            <div style={{ textAlign: 'left', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '15px', marginBottom: '30px' }}>
                <h3 style={{ color: '#34495e', marginTop: '0' }}>Description</h3>
                <p style={{ color: '#576574', lineHeight: '1.6' }}>{quiz.description}</p>
                <hr style={{ border: '0', borderTop: '1px solid #ddd', margin: '20px 0' }} />
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>
                    Nombre de questions : {quiz.questions ? quiz.questions.length : 0}
                </p>
            </div>

            <button
                onClick={handleStart}
                style={{
                    display: 'inline-block',
                    backgroundColor: '#3498db',
                    color: 'white',
                    padding: '15px 50px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    boxShadow: '0 4px 15px rgba(52, 152, 219, 0.4)'
                }}
            >
                Commencer le Quiz
            </button>
        </div>
    );
}

export default QuizDetailsPage;