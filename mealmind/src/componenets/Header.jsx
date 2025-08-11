import "../styles/Header.css";
//Nav bar for application 

export default function Header() {
    return (
        <header className="header">
            <div className="logo">MealMind</div>
            <nav>
                <ul>
                    <li><a href="#">Home</a></li>
                    <li><a href="#">Pantry</a></li>
                    <li><a href="#">Meal Plan</a></li>
                    <li><a href="#">Profile</a></li>
                </ul>
            </nav>
        </header>
    )
}
