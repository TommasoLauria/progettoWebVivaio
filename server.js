const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken"); 
const JWT_SECRET = "chiave_segreta"; 

const app = express();
const port = 3000;

const pool = mysql.createPool({
    host:"localhost",
    user:"root",
    password:"",
    database:"vivaio",
    waitForConnections:true,
    connectionLimit: 10,
    queueLimit: 0
});
const promisePool=pool.promise();
//middleware
app.use((req, res, next) => {
    console.log(`log Ricevuta richiesta: ${req.method} ${req.url}`);
    next(); 
});
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //middlware per leggere i dati inviati tramite form 
app.use(cookieParser());
app.get('/login', (req, res) => {
    if (req.cookies.token) {
        res.redirect(302, '/dashboard');
    } else {
        res.sendFile(__dirname + '/public/login.html');
    }
});
app.use(express.static("public", { extensions: ["html"] }));


//rotte
app.get('/api/piante', async (req, res) => {
    try{
        const [righe] = await promisePool.execute("SELECT * FROM piante"); //la query restituisce un array di due elementi, in 0 abbiamo i dati e in 1 i metadati
        res.json(righe);
    }catch(e){
        console.error("errore letture DB:",e);
        res.json([]);
    }
});
app.post('/api/piante', async (req, res) => {
    const dati = req.body;
    let dataConcimazione = null;
    if (dati.ultimaConcimazione) {
        dataConcimazione = dati.ultimaConcimazione.substring(0, 10); //   'aaaa/mm/gg'
    }
    try {
        if (dati.id) {
            const queryUpdate = `UPDATE piante SET nome=?, immagine=?, descrizione=?, categoria=?, prezzo=?, quantita=?, ultimaConcimazione=?, frequenza=? WHERE id=?`;
            await promisePool.execute(queryUpdate, [
                dati.nome, dati.immagine, dati.descrizione, dati.categoria, dati.prezzo, dati.quantita, dati.dataConcimazione, dati.frequenza, dati.id
            ]);
            res.json({ success: true, messaggio: "Pianta modificata con successo!" });
        
        } else {
            const queryInsert = `INSERT INTO piante (nome, immagine, descrizione, categoria, prezzo, quantita, ultimaConcimazione, frequenza) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            const [info] = await promisePool.execute(queryInsert, [
                dati.nome, dati.immagine, dati.descrizione, dati.categoria, dati.prezzo, dati.quantita, dataConcimazione, dati.frequenza
            ]);
            res.json({ success: true, messaggio: "Nuova pianta aggiunta con successo!", nuovoId: info.insertId });
        }
    } catch (error) {
        console.error("Errore salvataggio DB:", error);
        res.json({ success: false, messaggio: "Errore nel database." });
    }
});
app.delete('/api/piante', async (req, res) => {
    const idDaEliminare = req.body.id;
    try {
        const [pianta] = await promisePool.execute("SELECT nome FROM piante WHERE id = ?", [idDaEliminare]);
        
        if (pianta.length > 0) { //verifico se effitivamente c'è una riga con quell'id
            await promisePool.execute("DELETE FROM piante WHERE id = ?", [idDaEliminare]);
            res.json({ success: true, messaggio: "Pianta eliminata dal db!", nome: pianta[0].nome });
        } else {
            res.json({ success: false, messaggio: "Pianta non trovata o già eliminata.", nome: "" });
        }
    } catch (error) {
        console.error("Errore cancellazione DB:", error);
        res.json({ success: false, messaggio: "Errore interno.", nome: "" });
    }
});
function authenticateToken(req, res, next) {
    const token = req.cookies.token; 
    
    if (!token) {
        return res.redirect(302, "/login"); 
    }
    
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload; 
        next(); 
    } catch (err) {
        return res.redirect(302, "/login"); 
    }
}
app.get('/login', (req, res) => {
    if (req.cookies.token) {
        res.redirect(302, '/dashboard');
    } else {
        res.sendFile(__dirname + '/public/login.html');
    }
});
app.use(express.static("public", { extensions: ["html"] }));


app.post('/login', async (req, res) => {

    const username = req.body.username; 
    const password = req.body.password; 
    
    try {
        const query = "SELECT id, nome FROM utenti WHERE email = ? AND password = ?";
        const [righe] = await promisePool.execute(query, [username, password]); 

        if (righe.length > 0) {
            const user = righe[0];
            
            const payload = {
                userId: user.id, 
                userName: user.nome 
            };
            
            const token = jwt.sign(payload, JWT_SECRET, { algorithm: "HS256", expiresIn: "1h" });
            
            res.cookie("token", token, {
                httpOnly: true, 
                secure: false,  
                maxAge: 3600000,
                sameSite: "Strict" //impedisce attacchi di tipo crossSite
            });
            
            res.redirect(302, '/dashboard');
        } else {
            res.redirect(302, '/login?error=credenziali_errate');
        }
    } catch (err) {
        console.error("Errore DB Login:", err);
        res.status(500).send("Errore del server");
    }
});
app.get('/logout', (req, res) => {
    res.clearCookie('token'); 
    res.redirect(302, '/login');   
});

app.get('/dashboard', authenticateToken, (req, res) => {
    console.log("l'utente che è entrato in dashboard è:", req.user.userName)
    res.sendFile(__dirname + '/private/dashboard.html');

});

app.get('/gestione-pianta', authenticateToken, (req, res) => {
    console.log("l'utente che è entrata in gestione-pianta è: ", req.user.userName)
    res.sendFile(__dirname + '/private/gestionePianta.html');
});

app.get('/anteprima-pianta', (req, res) => {
    if (req.cookies.token) {
        const idPianta = req.query.id || '';
        res.redirect(302, `/gestione-pianta?id=${idPianta}`);
    } else {
        res.sendFile(__dirname + '/public/anteprimaPianta.html');
    }
});

app.listen(port, () => {
    console.log("Server attivo su http://localhost:" + port);
});
