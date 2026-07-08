const express = require("express");
const cookieParser = require("cookie-parser")
const app = express();
const port = 3000;
app.use(express.json());
app.use(express.static("public"));
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
        descrizione: "Il limone (Citrus limon) è un albero da frutto appartenente alla famiglia delle Rutaceae.",
        link: "https://it.wikipedia.org/wiki/Citrus_%C3%97_limon"
    }
];
app.get('/api/piante',(req,res)=>{
    res.json(catalogoPiante);
});
app.listen(port, () => {
    console.log("Server attivo su http://localhost:" + port);
});