import React, { useState, useEffect } from "react";
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

    formCard: {
        backgroundColor: '#16213e',
        padding: '25px',
        borderRadius: '15px',
        maxWidth: '700px',
        margin: '0 auto 30px auto',
        border: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'left',
    },

    formRow: {
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },

    label: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#a29bfe',
    },

    input: {
        backgroundColor: '#1a1a2e',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '8px',
        padding: '10px 14px',
        color: 'white',
        fontSize: '1rem',
        width: '100%',
        boxSizing: 'border-box',
        outline: 'none',
    },

    select: {
        backgroundColor: '#1a1a2e',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '8px',
        padding: '10px 14px',
        color: 'white',
        fontSize: '1rem',
        width: '100%',
        boxSizing: 'border-box',
        outline: 'none',
    },

    textarea: {
        backgroundColor: '#1a1a2e',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '8px',
        padding: '10px 14px',
        color: 'white',
        fontSize: '1rem',
        width: '100%',
        boxSizing: 'border-box',
        outline: 'none',
        resize: 'vertical',
        minHeight: '80px',
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

    buttonSecondary: {
        backgroundColor: '#6c5ce7',
        color: 'white',
        border: 'none',
        padding: '15px 40px',
        borderRadius: '12px',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 0 15px rgba(108, 92, 231, 0.4)',
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
    const [description, setDescription] = useState("");
    const [level, setLevel] = useState("");
    const [questions, setQuestions] = useState([]);

    const [error, setError] = useState(null);
    const [isValid, setIsValid] = useState(false);
    const [questionsSubmitted, setQuestionsSubmitted] = useState(false);
    const [questionIds, setQuestionIds] = useState([]);

    useEffect(() => {
        if (questions.length > 0 && title && description && level) {
            setIsValid(true);
        } else {
            setIsValid(false);
        }
    }, [title, description, level, questions]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const lines = ev.target.result.split("\n").map(l => l.trim()).filter(l => l !== "");

            if (lines.length < 2) {
                setError("Le fichier CSV doit contenir au moins une question (avec en-tête)");
                setIsValid(false);
                return;
            }

            // Ignorer la première ligne (en-tête)
            let tempQuestions = [];
            let errorDetected = false;

            for (let i = 1; i < lines.length; i++) {
                const fields = lines[i].split(",");

                if (fields.length !== 5 || fields.some(field => field.trim() === "")) {
                    setError(`Erreur ligne ${i + 1} : donnée manquante`);
                    errorDetected = true;
                    break;
                }

                if (!fields[0].trim() || !fields[1].trim() || !fields[2].trim() || !fields[4].trim()) {
                    setError(`Erreur ligne ${i + 1} : champs obligatoires manquants`);
                    errorDetected = true;
                    break;
                }

                tempQuestions.push({
                    text: fields[0].trim(),
                    options: fields[1].split("|").map(opt => opt.trim()),
                    correct_answer: fields[2].trim(),
                    points: parseInt(fields[3].trim()) || 10,
                    category: fields[4].trim()
                });
            }

            if (!errorDetected) {
                setQuestions(tempQuestions);
                setError(null);
            } else {
                setIsValid(false);
            }
        };
        reader.readAsText(file);
    };

    const handleSubmitQuestions = async () => {
        if (!isSignedIn) return navigate('/sign-up');

        try {
            const token = await getToken();
            const ids = [];

            for (const question of questions) {
                const response = await axios.post("http://127.0.0.1:5000/quiz/create-question", question, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                ids.push(response.data.question_id);
            }

            setQuestionIds(ids);
            setQuestionsSubmitted(true);
            setError(null);
            alert("Questions créées avec succès !");

        } catch (err) {
            console.error("Erreur lors de la création des questions :", err);
            if (err.response) {
                setError(`Erreur : ${err.response.data.error || JSON.stringify(err.response.data)}`);
            } else if (err.request) {
                setError("Le backend ne répond pas. Vérifiez qu'il est démarré.");
            } else {
                setError("Une erreur est survenue lors de la création des questions.");
            }
            setQuestionsSubmitted(false);
        }
    };

    const handleSubmitQuiz = async () => {
        if (!isSignedIn) return navigate('/sign-up');

        try {
            const token = await getToken();

            const quizData = {
                title,
                description,
                level,
                question_ids: questionIds
            };

            await axios.post("http://127.0.0.1:5000/quiz/create-quiz", quizData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            alert("Quiz créé avec succès !");
            navigate("/quiz-list");

        } catch (err) {
            console.error("Erreur d'envoi :", err);
            setError("Une erreur est survenue lors de la création du quiz.");
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>Créer un Quiz</h1>
                <div style={styles.underline}></div>
            </header>

            {/* Carte instructions */}
            <div style={styles.instructionCard}>
                <h3 style={{ color: '#a29bfe', marginBottom: '10px' }}>Comment préparer votre fichier ?</h3>
                <p style={{ fontSize: '0.9rem', color: '#b2bec3', margin: 0 }}>
                    Votre fichier CSV doit avoir une ligne d'en-tête, puis :<br />
                    • <b>Colonnes :</b> text , options , correct_answer , points , category<br />
                    • <b>Options :</b> séparées par <b>|</b> (ex: <code>Paris|Londres|Berlin|Madrid</code>)
                </p>
            </div>

            {/* Formulaire titre / description / niveau */}
            <div style={styles.formCard}>
                <div style={styles.formRow}>
                    <label htmlFor="title" style={styles.label}>Titre du Quiz</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Entrez le titre du quiz"
                        style={styles.input}
                    />
                </div>

                <div style={styles.formRow}>
                    <label htmlFor="description" style={styles.label}>Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Entrez une description du quiz"
                        style={styles.textarea}
                    />
                </div>

                <div style={styles.formRow}>
                    <label htmlFor="level" style={styles.label}>Niveau</label>
                    <select
                        id="level"
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        style={styles.select}
                    >
                        <option value="">Sélectionnez un niveau</option>
                        <option value="facile">Facile</option>
                        <option value="moyen">Moyen</option>
                        <option value="difficile">Difficile</option>
                    </select>
                </div>
            </div>

            {/* Zone d'upload */}
            <div
                style={styles.uploadBox}
                onClick={() => document.getElementById('quiz-import').click()}
            >
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📂</div>
                <p style={{ marginBottom: '0' }}><b>Cliquez pour choisir votre fichier CSV</b></p>
                <input
                    type="file"
                    id="quiz-import"
                    accept=".csv"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
            </div>

            {/* Zone de statut */}
            <div style={styles.statusText}>
                {questions.length > 0 && !questionsSubmitted && (
                    <div style={{ animation: 'fadeIn 0.5s' }}>
                        <p style={{ color: '#00d2d3' }}>
                            Fichier prêt : <b>{questions.length} question{questions.length > 1 ? 's' : ''} chargée{questions.length > 1 ? 's' : ''}</b>
                        </p>
                        {isValid ? (
                            <button
                                style={styles.button}
                                onClick={handleSubmitQuestions}
                                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                            >
                                CRÉER LES QUESTIONS
                            </button>
                        ) : (
                            <p style={{ color: '#fdcb6e', fontSize: '0.95rem' }}>
                                Veuillez remplir le titre, la description et le niveau pour continuer.
                            </p>
                        )}
                    </div>
                )}

                {questionsSubmitted && (
                    <div style={{ animation: 'fadeIn 0.5s' }}>
                        <p style={{ color: '#00d2d3' }}>✅ Questions créées avec succès !</p>
                        <button
                            style={styles.buttonSecondary}
                            onClick={handleSubmitQuiz}
                            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            PUBLIER LE QUIZ
                        </button>
                    </div>
                )}

                {error && <p style={{ color: '#ff7675' }}>{error}</p>}

                {!questions.length && !error && (
                    <p style={{ opacity: 0.6 }}>En attente d'un fichier valide...</p>
                )}
            </div>
        </div>
    );
}

export default MakePage;