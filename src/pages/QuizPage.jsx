import { useParams } from "react-router-dom";

function QuizPage() {
    const { quizId } = useParams();

    const quizName = "NomDuQuiz";
    const quizDescription = "Ceci est la description du quiz";

    return (
        <div>
            <h1>{quizName} (Quiz n°{quizId})</h1>

            <h2>Description</h2>
            <p>{quizDescription}</p>

            <div>
                <h2>Jouer le quiz</h2>
                <p>Choisissez le mode de jeu.</p>
                <ul>
                    <li><a href={`/play-versus/${quizId}`}>Duel 1 contre 1</a></li>
                    <li><a href={`/play-solo/${quizId}`}>Quiz en solo</a></li>
                </ul>
            </div>
        </div>
    )
}

export default QuizPage;