const express = require("express");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");
const FILE_PATH = path.join(__dirname, "piante.json");
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


function leggiPiante() {
    try {
        if (!fs.existsSync(FILE_PATH)) {
            fs.writeFileSync(FILE_PATH, JSON.stringify([]), "utf-8");
            return [];
        }
        const dati = fs.readFileSync(FILE_PATH, "utf-8");
        return JSON.parse(dati);
    } catch (error) {
        console.error("Errore nella lettura del file:", error);
        return [];
    }
}
function aggiungiPianta(nuovaPianta) {
    const piante = leggiPiante();
    piante.push(nuovaPianta);
    fs.writeFileSync(FILE_PATH, JSON.stringify(piante), "utf-8");
    return piante;
}
function modificaPianta(id, datiAggiornati) {
    const piante = leggiPiante();
    const index = piante.findIndex(p => Number(p.id) === Number(id));
    
    if (index !== -1) {
        piante[index] = { ...datiAggiornati, id: Number(id) };
        fs.writeFileSync(FILE_PATH, JSON.stringify(piante), "utf-8");
        return true;
    }
    return false;
}
function eliminaPianta(id) {
    const piante = leggiPiante();
    let nomeEliminato = "";
    const vecchioLunghezza = piante.length;

    for (let i = 0; i < piante.length; i++) {
        if (Number(piante[i].id) === Number(id)) {
            nomeEliminato = piante[i].nome;
            piante.splice(i, 1);
            break;
        }
    }

    if (piante.length < vecchioLunghezza) {
        fs.writeFileSync(FILE_PATH, JSON.stringify(piante), "utf-8");
        return nomeEliminato; 
    }
    return null; 
}

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});





app.get('/api/piante', (req, res) => {
    res.json(leggiPiante());
});
app.post('/api/piante', (req, res) => {
    const piantaRicevuta = req.body;
    const pianteAttuali = leggiPiante();
    
    let esiste = false; 

    for (let i = 0; i < pianteAttuali.length; i++) {
        if (Number(pianteAttuali[i].id) === Number(piantaRicevuta.id)) {
            esiste = true; 
            break;         
        }
    }
    
    if (esiste) {
        const successo = modificaPianta(piantaRicevuta.id, piantaRicevuta); 
        res.json({ success: successo, messaggio: successo ? "Pianta modificata con successo!" : "Errore nella modifica." }); //
    } else {
        aggiungiPianta(piantaRicevuta); 
        res.json({ success: true, messaggio: "Nuova pianta aggiunta con successo!" }); 
    }
});
app.delete('/api/piante', (req, res) => {
    const idDaEliminare = req.body.id;
    const nomeCancellato = eliminaPianta(idDaEliminare);
    
    if (nomeCancellato !== null) {
        res.json({ success: true, messaggio: "pianta eliminata dal db!", nome: nomeCancellato });
    } else {
        res.json({ success: false, messaggio: "Pianta non trovata o già eliminata.", nome: "" });
    }
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
