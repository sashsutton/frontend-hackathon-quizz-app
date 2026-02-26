import React, { useState, useEffect } from 'react';
import axios from 'axios'; 

function QuizList() {
    const [quizzes, setQuizzes] = useState([]);

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/quizzes');
                setQuizzes(response.data); 
            } catch (error) {
                console.error("Erreur serveur :", error);
            }
        };

        fetchQuizzes();
    }, []); 


    return (
    <div style={{ 
        padding: '40px 20px', 
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", 
        maxWidth: '900px', 
        margin: '0 auto', 
        backgroundColor: '#f8f9fa', 
        minHeight: '100vh' 
    }}>
        
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h1 style={{ color: '#2c3e50', fontSize: '36px', fontWeight: '800', marginBottom: '10px' }}>
                 Liste de Quiz
            </h1>
            <p style={{ color: '#7f8c8d', fontSize: '18px' }}>Choisis un défi !</p>
            <div style={{ 
                width: '60px', 
                height: '4px', 
                backgroundColor: '#3498db', 
                margin: '20px auto', 
                borderRadius: '2px' 
            }}></div>
        </div>

        {quizzes.length === 0 ? (
            <div style={{ 
                padding: '40px', 
                textAlign: 'center', 
                backgroundColor: '#ffffff', 
                borderRadius: '16px', 
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
                color: '#e67e22',
                border: '1px dashed #ffd8a8'
            }}
            >
                <p style={{ color: '#7f8c8d' }}>Pas de quiz disponible pour le moment.</p>
            </div>
        ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '25px' }}>
    {quizzes.map((quiz) => (
        <div key={quiz._id} style={{
            padding: '30px',
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', 
            textAlign: 'center',    
            transition: 'transform 0.2s ease',
            border: '1px solid #f1f2f6'
        }}>
            <div style={{ marginBottom: '15px' }}>
                <h2 style={{ 
                    margin: '0 0 10px 0', 
                    color: '#3498db', 
                    fontSize: '24px', 
                    fontWeight: '700' 
                }}>
                    {quiz.title}
                </h2>
                <span style={{
                    color: '#7f8c8d',
                    fontSize: '14px',
                    fontWeight: '600'
                }}>
                    Catégorie : <strong style={{ color: '#2c3e50' }}>{quiz.category}</strong>
                </span>
            </div>

            <p style={{ 
                color: '#576574', 
                fontSize: '16px', 
                lineHeight: '1.6', 
                marginBottom: '25px',
                maxWidth: '600px'
            }}>
                {quiz.description || "Préparez-vous à relever ce défi passionnant !"}
            </p>

            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                width: '100%',
                borderTop: '1px solid #f1f2f6', 
                paddingTop: '20px' 
            }}>
                <Link 
        to={`/quiz-details/${quiz._id}`} 
        style={{
            backgroundColor: '#3498db',
            color: 'white',
            padding: '12px 40px',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '16px',
            boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
            transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
    >
        Voir le Quiz
    </Link>
            </div>
        </div>
    ))}
</div>
        )}
    </div>
);
}

export default QuizList;