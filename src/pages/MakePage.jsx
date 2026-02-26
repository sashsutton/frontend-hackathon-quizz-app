import React, { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
        <div>
            <h1>Créer un Quiz</h1>
            <p>
                Format du fichier attendu :<br/>
                Ligne 1 : Titre<br/>
                Ligne 2 : Catégorie<br/>
                Ligne 3 : Difficulté<br/>
                Ligne 4 et suivantes : question;réponse_1;réponse_2;réponse_3;réponse_4;bonnes_réponses
            </p>

            <input 
                type="file" 
                id="quiz-import" 
                accept=".csv" 
                required 
                onChange={handleFileChange} 
            />

            <br /><br />

            {isValid && (
                <div>
                    <p>Fichier prêt : <b>{title}</b></p>
                    <button onClick={handleSubmit}>Créer le Quiz</button>
                </div>
            )}

            {error && <p style={{color: 'red'}}>{error}</p>}

            {!isValid && !error && (
                <p>Veuillez sélectionner un fichier CSV pour commencer.</p>
            )}

            {error && <p style={{color: 'red'}}>{error}</p>}
        </div>
    );
}

export default MakePage;