const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 3000;
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


app.get('/api/piante', (req, res) => {
    res.json(catalogoPiante);
});
app.post('/api/piante', (req, res) => {
    const piantaRicevuta = req.body;
    
    // Cerca se esiste già
    const index = catalogoPiante.findIndex(p => p.id === piantaRicevuta.id);
    
    if (index !== -1) {
        catalogoPiante[index] = piantaRicevuta; 
    } else {
        catalogoPiante.push(piantaRicevuta);
    }
    
    res.json({ success: true, messaggio: "Pianta salvata sul server!" });
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    console.log("Tentativo di login con:", username, password);
    
    if (username === 'admin' && password === 'admin') {
        res.cookie('staff_auth', 'true', { maxAge: 3600000, httpOnly: true });
        res.redirect(302,'/dashboard');
    } else {
        res.redirect(302,'/login?error=credenziali_errate');
    }
});


app.get('/dashboard', (req, res) => {
    if (req.cookies.staff_auth === 'true') {
        res.sendFile(__dirname + '/private/dashboard.html');
    } else {
        res.redirect(302,'/login');
    }
});

app.get('/gestione-pianta', (req, res) => {
    if (req.cookies.staff_auth === 'true') {
        res.sendFile(__dirname + '/private/gestionePianta.html');
    } else {
        res.redirect(302,'/login');
    }
});


app.get('/logout', (req, res) => {
    res.clearCookie('staff_auth');
    res.send('Logout effettuato. <a href="/login.html">Torna al login</a>');
});

app.listen(port, () => {
    console.log("Server attivo su http://localhost:" + port);
});
