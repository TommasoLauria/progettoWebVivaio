let piantaCorrente = null;

document.addEventListener("DOMContentLoaded", async () => {
    const parametriUrl = new URLSearchParams(window.location.search);
    const idPianta = parametriUrl.get("id");

    if (idPianta) {
        await caricaDatiPianta(idPianta);
        impostaEventi();
    } else {
        document.getElementById("nome_pianta_gestione").textContent = "Nessuna pianta selezionata";
    }
    const bloccoLogin = document.getElementById("blocco_login_nav");
    const linkIcona = document.getElementById("link_icona_login");
    if (bloccoLogin && linkIcona) {
       
        bloccoLogin.classList.add("loggato");
    }
});

async function caricaDatiPianta(id) {
    try {
        const risposta = await fetch("/api/piante");
        const piante = await risposta.json();
        piantaCorrente = piante.find(p => Number(p.id) === Number(id));

        if (piantaCorrente) {
            document.getElementById("nome_pianta_gestione").textContent = piantaCorrente.nome;
            document.getElementById("immagine_pianta_gestione").src = piantaCorrente.immagine;
            document.getElementById("quantita_attuale").textContent = piantaCorrente.quantita;
        } else {
            document.getElementById("nome_pianta_gestione").textContent = "Pianta non trovata nel DB";
        }
    } catch (err) {
        console.error("Errore nel caricamento:", err);
    }
}

function impostaEventi() {
    const btnPiu = document.getElementById("pulsante_gestione_piu");
    const btnMeno = document.getElementById("pulsante_gestione_meno");
    const displayQuantita = document.getElementById("quantita_attuale");
    const bottoniSalva = document.querySelectorAll(".btn_salva_quantita");
    const btnSalvaManuale = bottoniSalva[0];
    const btnSalvaRapido = bottoniSalva[1];
    let quantitaVisiva = Number(piantaCorrente.quantita);

    btnPiu.addEventListener("click", () => {
        quantitaVisiva++;
        displayQuantita.textContent = quantitaVisiva;
    });

    btnMeno.addEventListener("click", () => {
        if (quantitaVisiva > 0) { 
            quantitaVisiva--;
            displayQuantita.textContent = quantitaVisiva;
        }
    });

    btnSalvaManuale.addEventListener("click", async () => {
        await salvaModificheServer(quantitaVisiva);
    });


    //Carico e Scarico Rapido
    const inputRapido = document.getElementById("quantita_rapida");
    const toggleOperazione = document.getElementById("toggle_operazione");

    btnSalvaRapido.addEventListener("click", async () => {
        const quantitaDigitata = Number(inputRapido.value);
        
        if (!quantitaDigitata || quantitaDigitata <= 0) {
            alert("Inserisci un numero valido nel box.");
            return;
        }

        //  se checked è scarico (-), altrimenti è carico (+)
        const isScarico = toggleOperazione.checked;
        let quantitaCalcolata;

        if (isScarico) {
            quantitaCalcolata = Number(piantaCorrente.quantita) - quantitaDigitata;
            if (quantitaCalcolata < 0){
                quantitaCalcolata = 0; 
            }
        } else {
            quantitaCalcolata = Number(piantaCorrente.quantita) + quantitaDigitata;
        }
        salvaModificheServer(quantitaCalcolata);
    });
}

async function salvaModificheServer(nuovaQuantita) {
    piantaCorrente.quantita = nuovaQuantita;

    try {
        const risposta = await fetch("/api/piante", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(piantaCorrente)
        });

        const esito = await risposta.json();
        
        if (esito.success) {
            document.getElementById("quantita_attuale").textContent = piantaCorrente.quantita;
            mostraPopupMessaggio("Magazzino Aggiornato", "Le scorte sono state salvate correttamente.");
        }
    } catch (err) {
        console.error("Errore di rete:", err);
        alert("Impossibile connettersi al server.");
    }
}
document.addEventListener("DOMContentLoaded", () => {
    
    const popup = document.getElementById("popup_pianta");
    const bottoneModifica = document.getElementById("bottone_modifica");
    if (bottoneModifica && popup) {
        bottoneModifica.addEventListener("click", () => {
            if (!piantaCorrente) return; // Se la pianta non è caricata non faccio niente
            
            const titolo = document.getElementById("titolo_popup_pianta");
            titolo.textContent = "Modifica Pianta";
            document.getElementById("pianta_id").value = piantaCorrente.id;
            document.getElementById("pianta_nome").value = piantaCorrente.nome;
            document.getElementById("pianta_immagine").value = piantaCorrente.immagine;
            document.getElementById("pianta_descrizione").value = piantaCorrente.descrizione || "";
            document.getElementById("pianta_categoria").value = piantaCorrente.categoria;
            document.getElementById("pianta_prezzo").value = piantaCorrente.prezzo;
            document.getElementById("pianta_quantita").value = piantaCorrente.quantita;
            document.getElementById("pianta_concimazione").value = piantaCorrente.ultimaConcimazione || "";
            document.getElementById("pianta_frequenza").value = piantaCorrente.frequenza || "";
            document.querySelector(".btn_elimina_pianta").disabled = false;
            popup.classList.add("attivo");
        });
    }
    const btnChiudi = document.querySelector(".btn_chiudi_popup");
    if (btnChiudi) {
        btnChiudi.addEventListener("click", () => {
            popup.classList.remove("attivo");
        });
    }

    const formPianta = document.getElementById("form_pianta");
    if (formPianta) {
        formPianta.addEventListener("submit", async (evento) => {
            evento.preventDefault();

            // Aggiorna la variabile locale con i nuovi dati
            piantaCorrente.nome = document.getElementById("pianta_nome").value;
            piantaCorrente.immagine = document.getElementById("pianta_immagine").value;
            piantaCorrente.descrizione = document.getElementById("pianta_descrizione").value;
            piantaCorrente.categoria = document.getElementById("pianta_categoria").value;
            piantaCorrente.prezzo = document.getElementById("pianta_prezzo").value;
            piantaCorrente.ultimaConcimazione = document.getElementById("pianta_concimazione").value;
            piantaCorrente.frequenza = document.getElementById("pianta_frequenza").value;

            // Salva sul server (usando la quantità che c'è già)
            await salvaModificheServer(piantaCorrente.quantita); 
            
            // Aggiorna i testi nella pagina sotto il popup
            document.getElementById("nome_pianta_gestione").textContent = piantaCorrente.nome;
            document.getElementById("immagine_pianta_gestione").src = piantaCorrente.immagine;
            
            popup.classList.remove("attivo");
        });
    }

    const btnElimina = document.querySelector(".btn_elimina_pianta");
    if (btnElimina) {
        btnElimina.addEventListener("click", async () => {
            const conferma = confirm("ATTENZIONE: Sei sicuro di voler eliminare questa pianta dal sistema?");
            if (!conferma) return;

            try {
                const risposta = await fetch("/api/piante", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: piantaCorrente.id })
                });
                const esito = await risposta.json();

                if (esito.success) {
                    alert("Pianta eliminata con successo!");
                    window.location.href = "/dashboard"; 
                } else {
                    alert("Errore durante l'eliminazione.");
                }
            } catch (err) {
                console.error("Errore di rete:", err);
            }
        });
    }
});
function mostraPopupMessaggio(titolo, messaggio) {
    const popup = document.getElementById("popup_messaggio");
    document.getElementById("titolo_messaggio").textContent = titolo;
    document.getElementById("testo_messaggio").textContent = messaggio;
    popup.classList.add("attivo");
    document.getElementById("chiudi_popup_messaggio").onclick = () => {
        popup.classList.remove("attivo");
    };
}