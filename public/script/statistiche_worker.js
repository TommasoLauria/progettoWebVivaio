self.onmessage = function(e) {
    const piante = e.data;
    
    const conteggioCategorie = {};
    const valori = []; 

    for (let i = 0; i < piante.length; i++) {
        const pianta = piante[i];
        let cat = "";
        if (pianta.categoria) {
            cat = pianta.categoria;
        } else {
            cat = "Nessuna";
        }
        const quantitaNumerica = Number(pianta.quantita);
        if (conteggioCategorie[cat]) {
            conteggioCategorie[cat] = conteggioCategorie[cat] + quantitaNumerica;
        } else {
            conteggioCategorie[cat] = quantitaNumerica;
        }
        const prezzoPulito = String(pianta.prezzo).replace(",", ".");
        const prezzoNumerico = Number(prezzoPulito) || 0;
        const valoreTotale = prezzoNumerico * quantitaNumerica;
        
        valori.push([pianta.nome, valoreTotale]);
    }
    self.postMessage({ 
        type: "done",
        categorie: conteggioCategorie,
        valori: valori
    });
};