import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

function QuizDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isLoaded, isSignedIn, getToken } = useAuth();

    const [quiz, setQuiz] = useState(null);

    useEffect(() => {
        const fetchQuizDetails = async () => {
            try {
                const token = await getToken();

                const response = await axios.get(`http://127.0.0.1:5000/quiz/page/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                setQuiz(response.data.quiz);
            } catch (error) {
                console.error("Token not verified ", error);
            }
        };

        if (isLoaded) {
            fetchQuizDetails();
        }
    }, [id, isLoaded, getToken]);

    const handleStart = () => {
        if (!isSignedIn) {
            navigate('/sign-up');
        } else {
            navigate(`/play/${quiz._id}`);
        }
    };

    if (!quiz) return <div style={{ textAlign: 'center', padding: '50px' }}>Quiz introuvable </div>;

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