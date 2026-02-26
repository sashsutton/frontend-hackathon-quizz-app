import { useState } from "react"

function MakePage() {

    const [valid, setValid] = useState(true);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
            const lines = ev.target.result.split("\n");
            
            let isValid = true;

            for (const line of lines) {
                const trimmed = line.trim();

                if (trimmed === "") continue; // Ligne vide

                const fields = line.split(";");
                if (fields.length !== 6) isValid = false;
            }
            
            setValid(isValid);
            console.log("Il est " + valid + " que le fichier est valide");
        } 
        reader.readAsText(file);
    }


    return (
        <div>
            <h1>Créer un Quiz</h1>
            <p>
            Vous pouvez créer un quiz en important un fichier csv respectant le format suivant : <br/>
            question;réponse_1;réponse_2;réponse_3;réponse_4;bonnes_réponses
            </p>

            <form action="/make-quiz" method="POST">
                <input type="file" id="quiz-import" name="quiz-import" accept=".csv" required onChange={handleFileChange}></input>
                {valid && <input type="submit" value="Créer"></input>}
                {!valid && <p className="warning">Fichier non valide, vérifiez qu'il respecte bien le format décrit ci-dessus</p>}
            </form>
        </div>
    )
}

export default MakePage;