


function Navbar() {
    const isConnected = false;

    return(
        <nav className="nav-crumbs">
        
        <ul className="">
            <li class="nav-crumb"><a href="/">Accueil</a></li>
            <li class="nav-crumb"><a href="/play">Jouer</a></li>
            <li class="nav-crumb"><a href="/make">Créer</a></li>
            <li class="nav-crumb"><a href="/quiz-list">Liste des quiz</a></li>
            {!isConnected && <li class="nav-crumb"><a href="/login">Se connecter</a></li>}
            {isConnected && <li class="nav-crumb"><a href="/logout">Se déconnecter</a></li>}
        </ul>
        </nav>

    )
}


export default Navbar
