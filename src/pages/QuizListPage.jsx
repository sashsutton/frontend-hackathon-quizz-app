
function QuizList() {
    const list_of_quiz = ["placeholder_quiz1", "placeholder_quiz2", "placeholder_quiz3"];

    return (
        <div>
            <h1>Liste des quiz</h1>

            <ul>
                {list_of_quiz.map((item, index) => (
                    <li key={index}><a href="">{item}</a></li>
                ))
                }   
                
            </ul>

        </div>
    )
}

export default QuizList;