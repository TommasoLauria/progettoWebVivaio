const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const port = 3000;
app.use((req, res, next) => {
    console.log(`[LOG] Ricevuta richiesta: ${req.method} ${req.url}`);
    next(); // Continua verso le rotte successive
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(express.static("public"));

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});


const catalogoPiante = [
    {
        id: 1,
        nome: "Surfinia",
        prezzo: "1,50 €",
        immagine: "/img/piante/surfina.png",
        disponibilita: "Disponibile",
        categoria: "fiori",
        descrizione: "La Surfinia, il cui nome scientifico è Petunia x hybrida, appartiene al genere Petunia e alla famiglia delle Solanaceae.",
        link: "https://www.piante.it/surfinia/"
    },
    {
        id: 2,
        nome: "Rosa",
        prezzo: "3,00 €",
        immagine: "/img/piante/rosa.png",
        disponibilita: "Pochi pezzi",
        categoria: "fiori",
        descrizione: "Amatissima e molto conosciuta per le sue innumerevoli varietà, la Rosa è un genere di arbusto appartenente alla famiglia delle Rosaceae.",
        link: "https://www.piante.it/rosa/"
    },
    {
        id: 3,
        nome: "primula",
        prezzo: "25,00 €",
        immagine: "/img/piante/Primula vulgaris.png",
        disponibilita: "Disponibile",
        categoria: "alberi",
        descrizione: "La primula è un genere di piante appartenente alla famiglia delle Primulaceae.",
        link: "https://it.wikipedia.org/wiki/Primula"
    }
];

// 5. API CATALOGO
app.get('/api/piante', (req, res) => {
    res.json(catalogoPiante);
});

// 6. ROTTA GESTIONE LOGIN (POST) - QUESTA È QUELLA CHE CHIAMI DAL FORM
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    console.log("Tentativo di login con:", username, password);
    
    if (username === 'admin' && password === 'admin') {
        res.cookie('staff_auth', 'true', { maxAge: 3600000, httpOnly: true });
        res.send('Login effettuato con successo! <a href="/area-riservata">Vai all\'area riservata</a>');
    } else {
        res.status(401).send('Credenziali non valide. <a href="/login.html">Riprova</a>');
    }
});


app.get('/area-riservata', (req, res) => {
    if (req.cookies.staff_auth === 'true') {
        res.send('<h1>Benvenuto Staff!</h1><p>Cookie riconosciuto.</p><a href="/logout">Logout</a>');
    } else {
        res.status(403).send('Accesso negato.');
    }
});


app.get('/logout', (req, res) => {
    res.clearCookie('staff_auth');
    res.send('Logout effettuato. <a href="/login.html">Torna al login</a>');
});

app.listen(port, () => {
    console.log("Server attivo su http://localhost:" + port);
});