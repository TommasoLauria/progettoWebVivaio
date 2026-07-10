# Vivai Carm Giardini

Sito web per un vivaio, pensato sia come sito vetrina per i clienti sia come strumento di gestione per lo staff.

L'obiettivo del progetto e' permettere ai clienti di consultare informazioni sulle piante e aiutare gli operatori del vivaio nella gestione del magazzino. Ogni pianta puo' essere associata a un QR code o a un barcode: una volta scannerizzato, il codice apre una pagina dedicata alla pianta.

## Aree del progetto

Il progetto e' diviso in due aree principali:

- Area pubblica: sito vetrina accessibile a tutti.
- Area privata: area staff protetta da login per gestione piante e magazzino.

## Funzionalita principali

- Navigazione pubblica con Home, Chi siamo, Catalogo e Contatti.
- Catalogo piante con ricerca testuale e filtro per categoria.
- Login staff con autenticazione tramite cookie.
- Dashboard privata con elenco piante.
- Vista desktop a tabella e vista mobile a card verticali.
- Creazione e modifica delle piante tramite popup.
- Generazione di QR code e barcode per ogni pianta.
- Popup di anteprima codice con possibilita' di stampa.
- URL specifico per ogni codice, ad esempio `/gestione-pianta?id=123`.

## Pagine pubbliche

### Home

La home presenta il vivaio con una grande immagine di sfondo, il titolo "La natura a casa tua", un sottotitolo e un pulsante per accedere al catalogo.

Include anche:

- sezione "In evidenza" con piante di stagione consigliate;
- card con effetto hover per mostrare la descrizione;
- sezione "Il viaggio delle nostre piante" con immagini e testi alternati.

### Chi siamo

Pagina dedicata alla storia del vivaio.

Contiene:

- intestazione con titolo e sottotitolo;
- sezione "Le nostre radici";
- immagine del fondatore;
- gallery fotografica con effetto zoom.

### Catalogo

Pagina con elenco delle piante disponibili.

Contiene:

- barra di ricerca;
- menu a tendina per filtrare le categorie;
- griglia prodotti caricata tramite API Node.js;
- card con immagine, nome, prezzo e disponibilita'.

### Contatti

Pagina con:

- form di contatto;
- mappa Google Maps;
- telefono, email e orari.

### Login

Pagina di accesso per lo staff.

Contiene:

- form centrato;
- campi username e password;
- invio dati al server Express.

### Anteprima Pianta

Pagina pensata per mostrare al cliente la pianta scannerizzata.

Contiene:

- immagine;
- descrizione;
- prezzo.

## Pagine private

### Dashboard

La dashboard e' la pagina principale dell'area staff.

Contiene:

- tabella con tutte le piante;
- card verticali su mobile;
- modifica pianta;
- generazione QR code;
- generazione barcode;
- popup di stampa;
- pulsante fisso con icona `+` per creare una nuova pianta.

Il popup di creazione/modifica include:

- nome pianta;
- immagine URL;
- categoria;
- prezzo;
- quantita';
- soglia minima;
- ultima concimazione;
- frequenza concimazione.

### Gestione Pianta

La pagina `/gestione-pianta?id=123` e' pensata per la gestione rapida da mobile.

Se l'utente non e' loggato, viene reindirizzato all'anteprima pubblica. Se e' loggato, accede alla pagina di gestione.

La pagina prevede:

- nome e foto della pianta;
- quantita' attuale;
- pulsanti per aumentare o diminuire la quantita';
- input per aggiornamenti di quantita' piu' grandi;
- checkbox per registrare la concimazione;
- form di modifica dei dati principali della pianta.

## Interazione utenti

### Cliente

Il cliente puo':

- visitare le pagine pubbliche;
- esplorare il catalogo;
- cercare e filtrare piante;
- scannerizzare QR code o barcode per vedere la scheda della pianta.

### Staff

Lo staff puo':

- effettuare il login;
- visualizzare l'inventario;
- creare e modificare piante;
- generare QR code e barcode;
- stampare i codici;
- aggiornare rapidamente quantita' e concimazioni da mobile.

## Database previsto

### Utenti

- `id`
- `nome`
- `email`
- `password_hash`

### Piante

- `id`
- `codice_qr`
- `codice_a_barre`
- `nome`
- `descrizione`
- `prezzo`
- `categoria`
- `immagine_url`
- `giacenza`
- `ultima_concimazione`
- `frequenza_concimazione`

## Tecnologie

- HTML
- CSS
- JavaScript
- Node.js
- Express
- Cookie Parser
- QRCode.js
- JsBarcode

## Font

- Titoli: Montserrat
- Testi e dashboard: Inter

## Avvio locale

Installa le dipendenze:

```bash
npm install
```

Avvia il server:

```bash
npm run dev
```

Apri il sito:

```text
http://localhost:3000
```

## Credenziali staff di sviluppo

```text
username: admin
password: admin
```

## Anteprime dal documento di progetto

Le immagini estratte dalla proposta sono disponibili nella cartella `readme-assets/pdf-images`.

![Anteprima progetto 1](readme-assets/pdf-images/proposta-000.png)

![Anteprima progetto 2](readme-assets/pdf-images/proposta-001.png)

![Anteprima progetto 3](readme-assets/pdf-images/proposta-002.png)
