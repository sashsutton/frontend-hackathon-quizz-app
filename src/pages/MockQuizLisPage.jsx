import React, { useState, useEffect } from 'react';

function QuizList() {
    const mockQuizzes = [
        { _id: "1", title: "Python pour les Débutants", category: "Informatique" },
        { _id: "2", title: "Réseaux et Sécurité", category: "Cyber" },
        { _id: "3", title: "Culture Générale du Web", category: "Général" },
        { _id: "4", title: "React : Le Duel", category: "Frontend" }
    ];

    const [quizzes, setQuizzes] = useState(mockQuizzes);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h1 style={{ color: '#2c3e50' }}> Quiz Disponibles (Mode Démo)</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {quizzes.map((quiz) => (
                    <div key={quiz._id} style={{
                        padding: '15px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        backgroundColor: '#f9f9f9',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <a href={`/quiz/${quiz._id}`} style={{ 
                            fontSize: '20px', 
                            color: '#3498db', 
                            textDecoration: 'none',
                            fontWeight: 'bold' 
                        }}>
                            {quiz.title}
                        </a>
                        <p style={{ margin: '5px 0 0', color: '#7f8c8d', fontSize: '14px' }}>
                            Catégorie : <strong>{quiz.category}</strong>
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default QuizList;