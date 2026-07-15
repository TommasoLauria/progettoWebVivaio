google.charts.load('current', {'packages':['corechart']});
let pianteDashboard = [];
document.addEventListener("DOMContentLoaded", async () => {
    eventiFissi();
    await caricaDatiPiante();
    //una volta caricati i dati 
    renderizzaTabella();
    if (pianteDashboard.length > 0) {
        console.log("1. Piante caricate! allora avvio il worker ");
        avviaCalcoliGrafici();
    } else {
        console.log("Nessuna pianta in magazzino");
    }

    const bloccoLogin = document.getElementById("blocco_login_nav");
    const linkIcona = document.getElementById("link_icona_login");
    if (bloccoLogin && linkIcona) {
       
        bloccoLogin.classList.add("loggato");
    }
    const corpo = document.getElementById("corpo");
    if (corpo) {
        const inputRicerca = document.getElementById("cerca_pianta");
        const tendinaCategoria = document.getElementById("filtro");

        if (inputRicerca && tendinaCategoria) {
            inputRicerca.addEventListener("input", filtraPiante); 
            tendinaCategoria.addEventListener("change", filtraPiante); 
        }
    }
});

function eventiFissi() {
    document.getElementById("bottone_aggiungi").addEventListener("click", () => apriPopupPianta());
    document.getElementById("form_pianta").addEventListener("submit", gestisciSalvataggioPianta);
    document.getElementById("bottone_stampa_codice").addEventListener("click", () => window.print());
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
        if (!risposta.ok) {
            throw new Error("Errore nel caricamento delle piante");
        }        
        pianteDashboard = await risposta.json(); //carico i dati del bd nell'array locale
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
        if (pianta.id) {
            const riga = creaRigaTabella(pianta);
            if (riga instanceof Node) {
                corpo.appendChild(riga);
            } else {
                console.error("Errore: creaRigaTabella non ha restituito un elemento HTML valido per la pianta:", pianta);
            }
        }
    });
}

function creaRigaTabella(pianta) {
    try {
        const riga = document.createElement("div");
        riga.className = "riga"; 
        const coloreClasse = pianta.quantita < 5 ? "testo_rosso" : "";
        
        riga.innerHTML = `
            <div class="desktop_pianta">
                <img src="${pianta.immagine}" class="img_desktop" alt="pianta"> 
                <strong>${pianta.nome || 'Senza nome'}</strong>
            </div>
            <div class="desktop_categoria">${pianta.categoria || '-'}</div>
            <div class="desktop_quantita ${coloreClasse}">${pianta.quantita ?? 0}</div>
            <div class="desktop_concime">${formattaData(pianta.ultimaConcimazione)}</div>

            <div class="mobile_card">
                <img src="${pianta.immagine}" class="img_mobile" alt="pianta">
                <div class="mobile_dati">
                    <div class="riga_anteprima">
                        <span>Nome</span>
                        <div class="box_input">${pianta.nome || 'Senza nome'}</div>
                    </div>
                    <div class="riga_anteprima">
                        <span>Quantità</span>
                        <div class="box_input ${coloreClasse}">${pianta.quantita ?? 0}</div>
                    </div>
                    <div class="riga_anteprima">
                        <span>Concime</span>
                        <div class="box_input">${formattaData(pianta.ultimaConcimazione)}</div>
                    </div>
                </div>
            </div>
            <div class="codici"></div>
            <div class="azioni"></div>
        `;

        const contenitoreCodici = riga.querySelector(".codici");
        if(contenitoreCodici) {
            contenitoreCodici.appendChild(creaBottoneIcona("barcode", () => apriPopupCodice(pianta, "barcode")));
            contenitoreCodici.appendChild(creaBottoneIcona("qr", () => apriPopupCodice(pianta, "qr")));
        }

        const contenitoreAzioni = riga.querySelector(".azioni");
        if(contenitoreAzioni) {
            contenitoreAzioni.appendChild(creaBottoneIcona("modifica", () => {
                window.location.href = `/gestione-pianta?id=${pianta.id}`;
            }));
            contenitoreAzioni.appendChild(creaBottoneIcona("elimina", async()=>{
                const conferma = confirm(`Sei sicuro di voler eliminare ${pianta.nome || 'questa pianta'}?`);
                if (!conferma) return;
    
                try {
                    const risposta = await fetch("/api/piante", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: pianta.id }) 
                    });
                    const dati = await risposta.json();
    
                    if (dati.success) {
                        pianteDashboard = pianteDashboard.filter(p => p.id !== pianta.id);
                        renderizzaTabella(); 
                    } else {
                        alert("Impossibile eliminare: " + dati.messaggio);
                    }
                } catch (err) {
                    console.error("Errore di rete durante l'eliminazione:", err);
                    alert("Errore di connessione col server.");
                }
            }));
        }
        return riga; 
    } catch (err) {
        console.error("ERRORE CRITICO in creaRigaTabella per la pianta:", pianta, err);
        return null; 
    }
}
function creaBottoneIcona(tipo, azioneClick) {
    const icone = {
        qr: "/img/qrcode_icon.png",
        barcode: "/img/barcode_icon.png",
        modifica: "/img/edit_icons.png",
        elimina: "img/elimina.png"
    };

    const bottone = document.createElement("button");
    bottone.type = "button";
    bottone.className = "bottone_icona";
    bottone.innerHTML = `<img src="${icone[tipo]}" alt="${tipo}" class="icona_azione">`;
    bottone.addEventListener("click", azioneClick);
    return bottone;
}

function apriPopupPianta() { 
    const popup = document.getElementById("popup_pianta");
    const titolo = document.getElementById("titolo_popup_pianta");
    titolo.textContent = "Nuova Pianta";
    document.getElementById("form_pianta").reset(); 
    
    popup.classList.add("attivo");
}

async function gestisciSalvataggioPianta(evento) {
    evento.preventDefault(); 

    const nuovaPianta = { 
        nome: document.getElementById("pianta_nome").value,
        immagine: document.getElementById("pianta_immagine").value,
        descrizione:document.getElementById("pianta_descrizione").value,
        categoria: document.getElementById("pianta_categoria").value,
        prezzo: document.getElementById("pianta_prezzo").value,
        quantita: Number(document.getElementById("pianta_quantita").value),
        ultimaConcimazione: document.getElementById("pianta_concimazione").value,
        frequenza: document.getElementById("pianta_frequenza").value
    };
    try {
        const risposta = await fetch("/api/piante", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuovaPianta)
        });

        const dati = await risposta.json();
        console.log("Risposta server:", dati);

        if (dati.success) {
            nuovaPianta.id = dati.nuovoId; 
            pianteDashboard.push(nuovaPianta); 
            renderizzaTabella(); 
            chiudiPopup(document.getElementById("popup_pianta"));
        } else {
            alert("Errore dal server: " + dati.messaggio);
        }

    } catch (errore) {
        console.error("Errore durante il salvataggio sul server:", errore);
    }
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
    popup.classList.add("attivo");
}

function chiudiPopup(popupElement) {
    if (popupElement) {
        popupElement.classList.remove("attivo");
    }
}

function formattaData(stringaData) {
    if (!stringaData) return "-";
    const data = new Date(stringaData);
    return data.toLocaleDateString("it-IT"); 
}

let datiGraficiPronti = null;
let googleChartsPronto = false;//true una volta caricata la libreria
google.charts.setOnLoadCallback(() => {
    googleChartsPronto = true;
    disegnaSeTuttoPronto(); 
});

function avviaCalcoliGrafici() {
    const worker = new Worker("./script/statistiche_worke.js");
    worker.postMessage(pianteDashboard);//invio le piante al worker
    worker.onmessage = (event) => {//aspetta che il worker manda done
        if (event.data.type === "done") {
            console.log("Il Worker ha finito ", event.data);
            datiGraficiPronti = event.data;
            disegnaSeTuttoPronto(); 
            worker.terminate();
        }
    };
    worker.onerror = (errore) => {
        console.error("Errore catastrofico nel Web Worker:", errore.message);
    };
}
function disegnaSeTuttoPronto() {
    if (googleChartsPronto && datiGraficiPronti) {
        disegnaGraficoTorta(datiGraficiPronti.categorie);
        disegnaGraficoBarre(datiGraficiPronti.valori);
    }
}
function disegnaGraficoTorta(datiCategorie) {
    const dataTable = [['Categoria', 'Pezzi']];
    for (const [categoria, quantita] of Object.entries(datiCategorie)) {
        dataTable.push([categoria, quantita]);
    }

    const data = google.visualization.arrayToDataTable(dataTable);
    const options = {
        title: "Distribuzione Piante per Categoria",
        is3D: true,
        backgroundColor: 'transparent',
        colors: ['#2E7D32', '#8BC34A', '#558B2F', '#A1887F'], 
        chartArea: { width: '90%', height: '80%' }
    };
    
    const chart = new google.visualization.PieChart(document.getElementById("grafico_torta"));
    chart.draw(data, options);
}

function disegnaGraficoBarre(datiValori) {
    const dataTable = [['Pianta', 'Valore (€)']];
    datiValori.forEach(riga => dataTable.push(riga));

    const data = google.visualization.arrayToDataTable(dataTable);
    
    const options = {
        title: "Valore Magazzino per Pianta (€)",
        legend: { position: "none" },
        backgroundColor: 'transparent',
        colors: ['#2E7D32'], 
        hAxis: { title: 'Valore in Euro (€)' },
        vAxis: { 
            title: 'Pianta',
            textStyle: { fontSize: 11 }
        },
        chartArea: { left: 120, width: '70%' }, 
        animation: { startup: true, duration: 1000, easing: 'out' }
    };
    const chart = new google.visualization.BarChart(document.getElementById("grafico_barre"));
    chart.draw(data, options);
}
function filtraPiante(){
    const testoRicerca = document.getElementById("cerca_pianta").value.toLowerCase();
    const categoriaRicercata = document.getElementById("filtro").value;
    let pianteFiltrate = [];
    
    for (let i = 0; i < pianteDashboard.length; i++){
        let pianta = pianteDashboard[i];
        let nome = false;
        let categoria = false; 
        const nomePianta = (pianta.nome || "").toLowerCase();
        if(nomePianta.includes(testoRicerca)){
            nome = true;
        }
        if (categoriaRicercata === "tutte" || pianta.categoria === categoriaRicercata) {
            categoria = true;
        }
        if(nome === true && categoria === true){
            pianteFiltrate.push(pianta);
        }
    }
    const corpo = document.getElementById("corpo");
    corpo.innerHTML = "";
    if (pianteFiltrate.length === 0) {
        corpo.innerHTML = `<p class="messaggio_errore">Nessuna pianta trovata.</p>`;
        return;
    }
    for (let i = 0; i < pianteFiltrate.length; i++) {
        const riga = creaRigaTabella(pianteFiltrate[i]);
        if (riga instanceof Node) {
            corpo.appendChild(riga);
        }
    }
}
