


function Navbar() {
    const isConnected = true;

    return(
        <nav className="crumbs">
        
        <ul className="">
            <li class="crumb"><a href="./play">Jouer</a></li>
            <li class="crumb"><a href="./make">Créer</a></li>
            {!isConnected && <li class="crumb"><a href="./login">Se connecter</a></li>}
            {isConnected && <li class="crumb"><a href="./logout">Se déconnecter</a></li>}
        </ul>
        </nav>

    )
}


export default Navbar
