window.onload=function(){
    const hamburger = document.getElementsByClassName("menu_hamburger")[0]; //dato che restituisce una lista di elementi 'HTMLCollection' prendo il primo elemento 
    const links = document.getElementsByClassName("collegamenti")[0]; 
    hamburger.addEventListener('click',()=> {
        if(links.classList.contains('attivo')){
            links.classList.remove('attivo');
            hamburger.src = "/img/hamburger.png";
        }else{
            links.classList.add("attivo");
            hamburger.src = "/img/close.png";
        }
    });
    const griglia = document.getElementById("griglia_catalogo");
    if (griglia) {
        caricaCatalogo();

        const inputRicerca = document.getElementById("cerca_pianta");
        const tendinaCategoria = document.getElementById("filtro");

        if (inputRicerca && tendinaCategoria) {
            inputRicerca.addEventListener("input", filtraPiante); 
            tendinaCategoria.addEventListener("change", filtraPiante); 
        }
    }

    if (document.getElementById("gestione")) {
        inizializzaDashboard();
    }
};

let piante = [];
async function caricaCatalogo() {
    const griglia = document.getElementById("griglia_catalogo");
    try{
        const res = await fetch ('/api/piante');
        piante = await res.json();
        mostraPiante(piante);
            
    }catch(errore){
        console.error("errore di connessione",errore);
        griglia.replaceChildren();
        const pErrore = document.createElement("p");
        pErrore.textContent="impossibile caricare il catalogo";
        griglia.appendChild(pErrore);
    }
}
function mostraPiante(piante) {
    const griglia = document.getElementById("griglia_catalogo");
    griglia.replaceChildren();
    if(piante.length===0){
        const p= document.createElement("p");
        p.textContent="nessuna pianta con questi filtri";
        griglia.appendChild(p);
        return;
    }

    piante.forEach(pianta => {
        const card= document.createElement("div");
        card.classList.add("card_pianta");

        const divImgPianta = document.createElement("div");
        divImgPianta.classList.add("img_pianta");
        const img = document.createElement("img");
        img.src = pianta.immagine;
        img.alt = pianta.nome;
        divImgPianta.appendChild(img);
        const divOverlay = document.createElement("div");
        divOverlay.classList.add("overlay_text");
        const qDescrizione = document.createElement("q");
        qDescrizione.textContent = pianta.descrizione;
        const aLink = document.createElement("a");
        aLink.href = pianta.link; 
        aLink.textContent = "Scopri";
        divOverlay.appendChild(qDescrizione);
        divOverlay.appendChild(aLink);
        

        const divInfoPianta = document.createElement("div");
        divInfoPianta.classList.add("info_pianta");
        const divInfoCatalogo = document.createElement("div");
        divInfoCatalogo.classList.add("info_pianta_catalogo");
        const divNomePrezzo = document.createElement("div");
        
        const pNome = document.createElement("p");
        pNome.classList.add("nome_pianta");
        pNome.textContent = pianta.nome;

        const pPrezzo = document.createElement("p");
        pPrezzo.classList.add("prezzo_pianta");
        pPrezzo.textContent = pianta.prezzo;
        divNomePrezzo.appendChild(pNome);
        divNomePrezzo.appendChild(pPrezzo);

        const pDisponibilita = document.createElement("p");
        pDisponibilita.classList.add("disponibilita_pianta");
        pDisponibilita.textContent=pianta.disponibilita;

        divInfoCatalogo.appendChild(divNomePrezzo);
        divInfoCatalogo.appendChild(pDisponibilita);
        divInfoPianta.appendChild(divInfoCatalogo);

        card.appendChild(divImgPianta);
        card.appendChild(divInfoPianta);
        griglia.appendChild(card)
    });
}
function filtraPiante(){
    const testoRicerca = document.getElementById("cerca_pianta").value.toLowerCase();
    const categoriaRicercata= document.getElementById("filtro").value;
    let pianteFiltrate = [];
    for (let i = 0; i<piante.length;i++){
        let pianta = piante[i];
        let nome = false;
        let categoria = false; 
        if(pianta.nome.toLowerCase().includes(testoRicerca)){
            nome =true;
        }     
        if (categoriaRicercata === "tutte" || pianta.categoria === categoriaRicercata) {
            categoria = true;
        }
        if( nome === true && categoria ===true){
            pianteFiltrate.push(pianta)
        }
    }
    mostraPiante(pianteFiltrate);

}
