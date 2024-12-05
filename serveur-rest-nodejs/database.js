const sqlite3 = require('sqlite3').verbose();

// Connexion à la base de données SQLite
const db = new sqlite3.Database('./securite_urgence.db', (err) => {
    if (err) {
        console.error('Erreur de connexion à SQLite :', err.message);
    } else {
        console.log('Base de données SQLite connectée.');
    }
});

// Initialisation des tables
const initDB = () => {
    db.serialize(() => {
        // Table utilisateurs
        db.run(`
            CREATE TABLE IF NOT EXISTS Utilisateurs (
                telephone TEXT PRIMARY KEY, -- telephone comme clé primaire
                nom TEXT NOT NULL,
                prenom TEXT NOT NULL,
                mot_de_passe TEXT NOT NULL,
                role TEXT CHECK(role IN ('citoyen', 'autorité')) NOT NULL
            )
        `);

        // Table incidents
        db.run(`
            CREATE TABLE IF NOT EXISTS Incidents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                categorie TEXT NOT NULL,
                coordonnees TEXT NOT NULL,
                description TEXT NOT NULL,
                auteur_id TEXT NOT NULL, -- telephone comme clé étrangère
                photo TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(auteur_id) REFERENCES Utilisateurs(telephone)
            )
        `);

        console.log('Tables initialisées avec téléphone comme clé primaire.');
    });
};

// Ajouter un utilisateur
const ajouterUtilisateur = (telephone, nom, prenom, mot_de_passe, role, callback) => {
    const query = `
        INSERT INTO Utilisateurs (telephone, nom, prenom, mot_de_passe, role)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.run(query, [telephone, nom, prenom, mot_de_passe, role], function (err) {
        if (err) {
            console.error('Erreur lors de l’ajout de l’utilisateur :', err.message);
            callback(err, null);
        } else {
            callback(null, telephone); // Retourne le numéro de téléphone (clé primaire)
        }
    });
};

// Vérifier l'existence d'un utilisateur par numéro de téléphone
const verifierUtilisateurParTelephone = (telephone, callback) => {
    const query = `
        SELECT telephone FROM Utilisateurs WHERE telephone = ?
    `;
    db.get(query, [telephone], (err, row) => {
        if (err) {
            console.error('Erreur lors de la vérification de l’utilisateur :', err.message);
            callback(err, null);
        } else {
            callback(null, !!row); // Retourne true si l'utilisateur existe, sinon false
        }
    });
};

// Login utilisateur
const loginUtilisateur = (telephone, mot_de_passe, callback) => {
    const query = `
        SELECT telephone FROM Utilisateurs
        WHERE telephone = ? AND mot_de_passe = ?
    `;
    db.get(query, [telephone, mot_de_passe], (err, row) => {
        if (err) {
            console.error('Erreur lors de la connexion utilisateur :', err.message);
            callback(err, null);
        } else if (!row) {
            callback(new Error('Utilisateur non trouvé ou mot de passe incorrect.'), null);
        } else {
            callback(null, row.telephone); // Retourne le numéro de téléphone de l'utilisateur
        }
    });
};

// Ajouter un incident
const ajouterIncident = (categorie, coordonnees, description, auteur_id, photo, callback) => {
    const query = `
        INSERT INTO Incidents (categorie, coordonnees, description, auteur_id, photo)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.run(query, [categorie, coordonnees, description, auteur_id, photo], function (err) {
        if (err) {
            console.error('Erreur lors de l’ajout de l’incident :', err.message);
            callback(err, null);
        } else {
            callback(null, this.lastID); // Retourne l'ID de l'incident
        }
    });
};

// Récupérer les incidents avec filtres
const recupererIncidents = (filtres, callback) => {
    let query = `SELECT * FROM Incidents WHERE 1=1`;
    const params = [];

    if (filtres.utilisateur) {
        query += ` AND auteur_id = ?`;
        params.push(filtres.utilisateur);
    }

    if (filtres.categorie) {
        query += ` AND categorie = ?`;
        params.push(filtres.categorie);
    }

    if (filtres.date) {
        query += ` AND DATE(timestamp) = DATE(?)`;
        params.push(filtres.date);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération des incidents :', err.message);
            callback(err, null);
        } else {
            callback(null, rows);
        }
    });
};

// Exporter les fonctions
module.exports = {
    db,
    initDB,
    ajouterUtilisateur,
    verifierUtilisateurParTelephone,
    loginUtilisateur,
    ajouterIncident,
    recupererIncidents,
};
