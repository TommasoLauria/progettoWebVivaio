
let pianteDashboard = [];

document.addEventListener("DOMContentLoaded", async () => {
    eventiFissi();
    await caricaDatiPiante();
    renderizzaTabella();
    const bloccoLogin = document.getElementById("blocco_login_nav");
    const linkIcona = document.getElementById("link_icona_login");

    if (bloccoLogin && linkIcona) {
        // Controlla se nei cookie del browser è presente 'staff_auth=true'
        if (document.cookie.includes("staff_auth=true")) {
            // Sei loggato! Aggiunge la classe che permette l'hover e cambia il link in /dashboard
            bloccoLogin.classList.add("loggato");
            linkIcona.href = "/dashboard";
        } else {
            // Non sei loggato: si assicura che non ci sia la classe
            bloccoLogin.classList.remove("loggato");
            linkIcona.href = "/login";
        }
    }
});

function eventiFissi() {
    document.getElementById("bottone_aggiungi").addEventListener("click", () => apriPopupPianta());
    document.getElementById("form_pianta").addEventListener("submit", gestisciSalvataggioPianta);
    document.getElementById("bottone_stampa_codice").addEventListener("click", () => window.print());
    document.getElementsByClassName("btn_elimina_pianta")[0].addEventListener("click",() =>eliminaPianta());
    document.querySelectorAll(".btn_chiudi_popup").forEach(bottone => {
        bottone.addEventListener("click", (evento) => {
            const popup = evento.target.closest(".overlay_popup");
            chiudiPopup(popup);
        });
    });
    const btnLogout = document.getElementById("logout");
    const popupLogout = document.getElementById("popup_logout");
    const btnConfermaLogout = document.getElementById("conferma_logout");
    const btnAnnullaLogout = document.getElementById("annulla_logout");

    if (btnLogout && popupLogout) {
        btnLogout.addEventListener("click", (event) => {
            event.preventDefault(); 
            popupLogout.classList.add("attivo");
        });
        btnConfermaLogout.addEventListener("click", () => {
            window.location.href = "/logout"; 
        });
        btnAnnullaLogout.addEventListener("click", () => {
            chiudiPopup(popupLogout);
        });
    }
}

async function caricaDatiPiante() {
    try {
        const risposta = await fetch("/api/piante");
        pianteDashboard = await risposta.json(); 
    } catch (err) {
        console.error("Errore nel caricamento dei dati:", err);
        pianteDashboard = [];
    }
}

function renderizzaTabella() {
    const corpo = document.getElementById("corpo");
    corpo.innerHTML = ""; 

    if (pianteDashboard.length === 0) {
        corpo.innerHTML = `<p class="messaggio_vuoto">Nessuna pianta presente nel catalogo.</p>`;
        return;
    }

    pianteDashboard.forEach(pianta => {
        corpo.appendChild(creaRigaTabella(pianta));
    });
}

function creaRigaTabella(pianta) {
    const riga = document.createElement("div");
    riga.className = "riga"; 
    const coloreClasse = pianta.quantita < 5 ? "testo_rosso" : "";
    riga.innerHTML = `
        <div class="desktop_pianta">
            <img src="${pianta.immagine}" class="img_desktop" > 
            <strong>${pianta.nome}</strong>
        </div>
        <div class="desktop_categoria">${pianta.categoria}</div>
        <div class="desktop_quantita ${coloreClasse}">${pianta.quantita}</div>
        <div class="desktop_concime">${formattaData(pianta.ultimaConcimazione)}</div>

        <div class="mobile_card">
            <img src="${pianta.immagine}" class="img_mobile" >
            
            <div class="mobile_dati">
                <div class="mobile_riga_dato">
                    <span>Nome</span>
                    <div class="box_input">${pianta.nome}</div>
                </div>
                <div class="mobile_riga_dato">
                    <span>Quantità</span>
                    <div class="box_input ${coloreClasse}">${pianta.quantita}</div>
                </div>
                <div class="mobile_riga_dato">
                    <span>Concime</span>
                    <div class="box_input">${formattaData(pianta.ultimaConcimazione)}</div>
                </div>
            </div>
        </div>

        <div class="codici"></div>
        <div class="azioni"></div>
    `;

    // Inseriamo i bottoni nei contenitori (cercando la classe singola)
    const contenitoreCodici = riga.querySelector(".codici");
    contenitoreCodici.appendChild(creaBottoneIcona("barcode", () => apriPopupCodice(pianta, "barcode")));
    contenitoreCodici.appendChild(creaBottoneIcona("qr", () => apriPopupCodice(pianta, "qr")));

    const contenitoreAzioni = riga.querySelector(".azioni");
    contenitoreAzioni.appendChild(creaBottoneIcona("modifica", () => apriPopupPianta(pianta)));

    return riga;
}
function creaBottoneIcona(tipo, azioneClick) {
    const icone = {
        qr: "/img/qrcode_icon.png",
        barcode: "/img/barcode_icon.png",
        modifica: "/img/edit_icons.png"
    };

    const bottone = document.createElement("button");
    bottone.type = "button";
    bottone.className = "bottone_icona";
    bottone.innerHTML = `<img src="${icone[tipo]}" alt="${tipo}" class="icona_azione">`;
    bottone.addEventListener("click", azioneClick);
    
    return bottone;
}

function apriPopupPianta(pianta = null) { //valore di default per pianta in modo tale da fare sia modifica che nuova
    const popup = document.getElementById("popup_pianta");
    const titolo = document.getElementById("titolo_popup_pianta");
    
    if (pianta) {
        (document.querySelector(".btn_elimina_pianta")).disabled = false
        titolo.textContent = "Modifica Pianta";
        document.getElementById("pianta_id").value = pianta.id;
        document.getElementById("pianta_nome").value = pianta.nome;
        document.getElementById("pianta_immagine").value = pianta.immagine;
        document.getElementById("pianta_categoria").value = pianta.categoria;
        document.getElementById("pianta_prezzo").value = pianta.prezzo;
        document.getElementById("pianta_quantita").value = pianta.quantita;
        document.getElementById("pianta_concimazione").value = pianta.ultimaConcimazione;
        document.getElementById("pianta_frequenza").value = pianta.frequenza;
    } else {
        (document.querySelector(".btn_elimina_pianta")).disabled = true
        titolo.textContent = "Nuova Pianta";
        document.getElementById("form_pianta").reset();
        document.getElementById("pianta_id").value = ""; 
        
    }
    popup.classList.add("attivo");
}

async function gestisciSalvataggioPianta(evento) {
    evento.preventDefault(); 

    const idCorrente = document.getElementById("pianta_id").value;

    const piantaSalvata = {
        id: idCorrente ? Number(idCorrente) : Date.now(), 
        nome: document.getElementById("pianta_nome").value,
        immagine: document.getElementById("pianta_immagine").value,
        categoria: document.getElementById("pianta_categoria").value,
        prezzo: document.getElementById("pianta_prezzo").value,
        quantita: Number(document.getElementById("pianta_quantita").value),
        ultimaConcimazione: document.getElementById("pianta_concimazione").value,
        frequenza: document.getElementById("pianta_frequenza").value
    };

    let indice = -1; 

    for (let i = 0; i < pianteDashboard.length; i++) {
        if (pianteDashboard[i].id === piantaSalvata.id) {
            indice = i; 
            break;      
        }
    }

    if (indice !== -1) {
        pianteDashboard[indice] = piantaSalvata; // Modifica
    } else {
        pianteDashboard.push(piantaSalvata); // Aggiungi nuova
    }
    try {
        const risposta = await fetch("/api/piante", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(piantaSalvata)
        });

        const dati = await risposta.json();
        console.log("Risposta server:", dati);

    } catch (errore) {
        console.error("Errore durante il salvataggio sul server:", errore);
    }
    renderizzaTabella(); 
    chiudiPopup(document.getElementById("popup_pianta"));
}

function apriPopupCodice(pianta, tipo) {
    const popup = document.getElementById("popup_codice");
    const anteprima = document.getElementById("anteprima_codice");
    const urlTesto = document.getElementById("url_codice");
    const titolo = document.getElementById("titolo_popup_codice");

    const urlCompleto = `${window.location.origin}/anteprima-pianta?id=${pianta.id}`;
    
    anteprima.innerHTML = "";
    urlTesto.textContent = urlCompleto;

    if (tipo === "qr") {
        titolo.textContent = `QR Code - ${pianta.nome}`;
        new QRCode(anteprima, {
            text: urlCompleto,
            width: 200,
            height: 200
        });
    } else if (tipo === "barcode") {
        titolo.textContent = `Barcode - ${pianta.nome}`;
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        anteprima.appendChild(svg);
        JsBarcode(svg, urlCompleto, {
            format: "CODE128",
            width: 2,
            height: 80,
            displayValue: false
        });
    }

    // Aggiunge la classe per mostrare il popup
    popup.classList.add("attivo");
}

function chiudiPopup(popupElement) {
    if (popupElement) {
        // Rimuove la classe per nascondere il popup
        popupElement.classList.remove("attivo");
    }
}

function formattaData(stringaData) {
    if (!stringaData) return "-";
    const data = new Date(stringaData);
    return data.toLocaleDateString("it-IT"); 
}
async function eliminaPianta(){
    const inputId = document.getElementById("pianta_id");
    
    if (!inputId) {
        console.error("Errore: L'elemento 'pianta_id' non esiste.");
        return;
    }

    const idCorrente = Number(inputId.value);
    if (!idCorrente){
        alert("Impossibile eliminare una pianta ancora non salvata ")
    }
    try {
        const risposta = await fetch("/api/piante", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({id:idCorrente})
        });
        

        const dati = await risposta.json();
        console.log("Risposta server:", dati);
        if (dati.success){
            for (let i = 0;i<pianteDashboard.length;i++){
                if(pianteDashboard[i].id === idCorrente){
                    pianteDashboard.splice(i,1);
                    break;
                }
            }
        }
        renderizzaTabella(); 
        chiudiPopup(document.getElementById("popup_pianta"));

    } catch (errore) {
        console.error("Errore durante il salvataggio sul server:", errore);
    }
    
}
