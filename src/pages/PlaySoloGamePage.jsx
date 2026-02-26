import { ScrollRestoration, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

function PlaySoloGamePage() {
    // DATA
    const { quizId } = useParams();
    const questions = ["Question 1 : Quelle est la bonne réponse ?", "Question 2: Quelle est la mauvaise réponse ?"]; // TODO : Récupérer les questions depuis la base de données
    const listOfAnswers = [["A", "B", "C", "D"], ["A", "B", "C", "D"]]; // TODO : Récupérer les réponses
    const listOfCorrectAnswers = [["A"], ["A"]]; // TODO : Récupérer les bonnes réponses
    const listOfPoints = ["100", "100"]; // TODO : Récupérer les bonnes valeurs de points
    const n = questions.length;

    const state = {
        ANSWERING: "answering",
        ANSWERED_CORRECT: "answeredCorrect",
        ANSWERED_NOT_CORRECT: "answeredNotCorrect",
        FINISHED: "finished"
    }

    const [questionIndex, setQuestionIndex] = useState(0);
    const [currentState, setCurrentState] = useState(state.ANSWERING);
    const [timer, setTimer] = useState(10);
    const [currentQuestion, setCurrentQuestion] = useState(questions[questionIndex]);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState(listOfAnswers[questionIndex])

    const intervalRef = useRef(null);

    const startTimer = () => {
        setTimer(10);

        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
        setTimer(prev => {
            if (prev <= 1) {
            clearInterval(intervalRef.current);
            setCurrentState(state.ANSWERED_NOT_CORRECT);
            return 0;
            }
            return prev - 1;
        });
        }, 1000);
    };

    const handleAnswer = (answer) => {
        const correctAnswers = listOfCorrectAnswers[questionIndex];

        if (correctAnswers.includes(answer)) {
            setCurrentState(state.ANSWERED_CORRECT);       
            const points = parseInt(listOfPoints[questionIndex]);
            setScore(prev => prev + points);
        }
        else {
            setCurrentState(state.ANSWERED_NOT_CORRECT);
        }
    }

    const start = () => {
        startTimer();
    }

    const nextQuestion = () => {
        startTimer();
        const newQuestionIndex = questionIndex + 1;

        setQuestionIndex(newQuestionIndex);

        if (newQuestionIndex >= n) {
            setCurrentState(state.FINISHED);
            return;
        }

        setAnswers(listOfAnswers[newQuestionIndex]);
        setCurrentQuestion(questions[newQuestionIndex]);
        setCurrentState(state.ANSWERING);
    }

    useEffect(() => {
        start();
    }, []); 

    return (
        <div>
            {currentState === state.ANSWERING && 
            <div>
                <p>Temps restant : {timer}</p>
                <h1>{currentQuestion}</h1>

                <div>
                    {answers.map((answer, id) => (
                        <button key={id} onClick={() => handleAnswer(answer)}>
                            {answer}
                        </button>
                ))}
                </div>
            </div>
            }

            {currentState === state.ANSWERED_CORRECT && 
                
            <div>
                <p>Temps restant : {timer}</p>
                <h1>{currentQuestion}</h1>

                <p>Bonne réponse !</p>

                <button onClick={nextQuestion}> Question suivante </button>
            </div>            
            }

            {currentState === state.ANSWERED_NOT_CORRECT && 

            <div>
                <p>Temps restant : {timer}</p>
                <h1>{currentQuestion}</h1>

                <p>Mauvaise Réponse...</p>
                <p>Une bonne réponse était : {listOfCorrectAnswers[questionIndex][0]}</p>
                
                <button onClick={nextQuestion}> Question suivante </button>
            </div>
            }

            {currentState === state.FINISHED &&
            
            <div>
                <h1>Quiz terminé !</h1>
                <p>Votre score est de {score} !</p>
            </div>

            }
            
        </div>
    );
}

export default PlaySoloGamePage;