import React, { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const styles = {
    container: { 
        padding: '60px 20px', 
        textAlign: 'center', 
        backgroundColor: '#1a1a2e', 
        color: 'white', 
        minHeight: '100vh',
        fontFamily: 'system-ui, sans-serif'
    },
    header: { marginBottom: '40px' },
    title: { fontSize: '3.5rem', fontWeight: '900', margin: '0' },
    underline: { width: '80px', height: '5px', background: '#e84393', margin: '20px auto', borderRadius: '5px' },
    
    instructionCard: {
        backgroundColor: '#16213e',
        padding: '25px',
        borderRadius: '15px',
        maxWidth: '700px',
        margin: '0 auto 30px auto',
        border: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'left',
        lineHeight: '1.6'
    },
    
    uploadBox: {
        backgroundColor: '#1c2a4e',
        border: '2px dashed #3498db',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        margin: '0 auto',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
    },
    
    button: {
        backgroundColor: '#e84393',
        color: 'white',
        border: 'none',
        padding: '15px 40px',
        borderRadius: '12px',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 0 15px rgba(232, 67, 147, 0.4)',
        marginTop: '20px',
        transition: 'transform 0.2s'
    },

    statusText: {
        marginTop: '20px',
        fontSize: '1.1rem',
        fontWeight: '600'
    }
};
function MakePage() {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [questions, setQuestions] = useState([]);
    
    const [error, setError] = useState(null);
    const [isValid, setIsValid] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const lines = ev.target.result.split("\n").map(l => l.trim()).filter(l => l !== "");
            
            if (lines.length < 4) {
                setError("Erreur ligne 1 donnée manquante");
                setIsValid(false);
                return;
            }

            const extractedTitle = lines[0];
            const extractedCategory = lines[1];
            const extractedDifficulty = lines[2];

            let tempQuestions = [];
            let errorDetected = false;

            for (let i = 3; i < lines.length; i++) {
                const fields = lines[i].split(";");
                
                if (fields.length !== 6 || fields.some(field => field.trim() === "")) {
                    setError(`Erreur ligne ${i + 1} donnée manquante`);
                    errorDetected = true;
                    break;
                }

                tempQuestions.push({
                    questionText: fields[0].trim(),
                    options: [fields[1].trim(), fields[2].trim(), fields[3].trim(), fields[4].trim()],
                    correctAnswer: fields[5].trim() 
                });
            }

            if (!errorDetected) {
                setTitle(extractedTitle);
                setCategory(extractedCategory);
                setDifficulty(extractedDifficulty);
                setQuestions(tempQuestions);
                
                setIsValid(true);
                setError(null);
            } else {
                setIsValid(false);
            }
        };
        reader.readAsText(file);
    };

    const handleSubmit = async () => {
        if (!isSignedIn) return navigate('/sign-up');

        try {
            const token = await getToken();
            const quizData = {
                title,
                category,
                difficulty,
                description: `Quiz sur ${category} `,
                questions: questions 
            };

            await axios.post("http://127.0.0.1:5000/quizzes", quizData, {
                headers: {
                    Authorization: `Bearer ${token}`, 
                    "Content-Type": "application/json"
                }
            });

            alert("Quiz créé dans MongoDB !");
            navigate("/quiz-list");

        } catch (err) {
            console.error("Erreur d'envoi :", err);
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>Créer un Quiz</h1>
                <div style={styles.underline}></div>
            </header>

            <div style={styles.instructionCard}>
                <h3 style={{color: '#a29bfe', marginBottom: '10px'}}>Comment préparer votre fichier ?</h3>
                <p style={{fontSize: '0.9rem', color: '#b2bec3'}}>
                    Votre fichier CSV doit suivre cet ordre précis :<br/>
                    • <b>Ligne 1 :</b> Titre du Quiz<br/>
                    • <b>Ligne 2 :</b> Catégorie (ex: JavaScript)<br/>
                    • <b>Ligne 3 :</b> Difficulté (ex: Facile)<br/>
                    • <b>Lignes 4+ :</b> Question ; Option 1 ; Option 2 ; Option 3 ; Option 4 ; Bonne Réponse
                </p>
            </div>

            <div style={styles.uploadBox} className="upload-box-interactive" 
            onClick={() => document.getElementById('quiz-import').click()}>
                <div style={{fontSize: '3rem', marginBottom: '10px'}}></div>
                <p style={{marginBottom: '0'}}><b>Cliquez pour choisir votre fichier CSV</b></p>
                <input 
                    type="file" 
                    id="quiz-import" 
                    accept=".csv" 
                    style={{display: 'none'}} 
                    onChange={handleFileChange} 
                />
            </div>

            <div style={styles.statusText}>
                {isValid && (
                    <div style={{animation: 'fadeIn 0.5s'}}>
                        <p style={{color: '#00d2d3'}}>Fichier prêt : <b>{title}</b></p>
                        <button 
                            style={styles.button} 
                            onClick={handleSubmit}
                            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            PUBLIER LE QUIZ
                        </button>
                    </div>
                )}

                {error && <p style={{color: '#ff7675'}}> {error}</p>}

                {!isValid && !error && (
                    <p style={{opacity: 0.6}}>En attente d'un fichier valide...</p>
                )}
            </div>
        </div>
    );
}

export default MakePage;