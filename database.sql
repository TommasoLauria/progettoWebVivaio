CREATE DATABASE IF NOT EXISTS vivaio;
USE vivaio;

CREATE TABLE IF NOT EXISTS utenti (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);
CREATE TABLE IF NOT EXISTS piante (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    immagine VARCHAR(500) NOT NULL,
    descrizione TEXT,
    categoria VARCHAR(50) NOT NULL,
    prezzo VARCHAR(20) NOT NULL,
    quantita INT NOT NULL DEFAULT 0,
    ultimaConcimazione DATE NULL,
    frequenza VARCHAR(100)
);

INSERT INTO utenti (nome, email, password_hash)
VALUES (
    'Amministratore',
    'admin',
    '$2b$10$HXE.0xaj7iyJcCFZ27hPrOpL3DZcLxN3JWA2Vll75m82hlnxzsqIC'
)
ON DUPLICATE KEY UPDATE
    nome = VALUES(nome),
    password_hash = VALUES(password_hash);

INSERT INTO piante (nome, immagine, descrizione, categoria, prezzo, quantita, ultimaConcimazione, frequenza)
VALUES
    (
        'Surfinia',
        '/img/piante/surfina.webp',
        'Pianta ornamentale molto colorata, adatta a balconi e fioriere.',
        'fiori',
        '3.00',
        62,
        '2026-07-01',
        'Ogni 15 giorni'
    ),
    (
        'Rosa',
        '/img/piante/rosa.webp',
        'Pianta da fiore classica, decorativa e profumata.',
        'fiori',
        '3.00',
        4,
        NULL,
        ''
    ),
    (
        'Rosmarino',
        '/img/piante/rosmarino.webp',
        'Pianta aromatica resistente, utile in cucina e facile da coltivare.',
        'aromatiche',
        '2.50',
        15,
        NULL,
        ''
    ),
    (
        'Olivo',
        '/img/piante/olivo.webp',
        'Pianta mediterranea sempreverde, adatta a giardini e grandi vasi.',
        'alberi',
        '25.00',
        8,
        NULL,
        ''
    );
