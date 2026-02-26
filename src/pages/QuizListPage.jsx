
function QuizList() {
    const list_of_quiz = ["placeholder_quiz1", "placeholder_quiz2", "placeholder_quiz3"];

    const html_list = []

    for (let i=0; i < list_of_quiz.length; i++) {
        const quiz = list_of_quiz[i];
        const quizId = i; // Temporaire, remplacer par l'id du quiz

        html_list.push(
            <li key={i}>
                <a href={`/quiz-list/${quizId}`}>{quiz}</a>
            </li>
        );
    }

    return (
        <div>
            <h1>Liste des quiz</h1>

            <ul>
                {html_list}
            </ul>

        </div>
    )
}

export default QuizList;