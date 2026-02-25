
function MakePage() {
    return (
        <div>
            <h1>Créer un Quiz</h1>
            <p>
            Vous pouvez créer un quiz en important un fichier csv respectant le format suivant : <br/>
            question;réponse_1;réponse_2;réponse_3;réponse_4
            </p>

            <form action="/make-quiz" method="POST">
                <input type="file" id="quiz-import" name="quiz-import" accept=".csv" required></input>
                <input type="submit" value="Créer"></input>
            </form>
        </div>
    )
}

export default MakePage;