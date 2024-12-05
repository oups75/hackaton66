const sqlite3 = require('sqlite3').verbose();
const { db } = require('../database'); // Importe la connexion SQLite

describe('Tests unitaires pour la base de données', () => {
    // Avant chaque test, initialise une base de données en mémoire
    let testDb;

    beforeEach((done) => {
        testDb = new sqlite3.Database(':memory:', (err) => {
            if (err) {
                console.error('Erreur lors de la création de la base en mémoire :', err.message);
                done(err);
            } else {
                console.log('Base de données en mémoire initialisée.');
                // Initialise les tables pour les tests
                testDb.serialize(() => {
                    testDb.run(`
                        CREATE TABLE IF NOT EXISTS Utilisateurs (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            nom TEXT NOT NULL,
                            email TEXT NOT NULL UNIQUE,
                            role TEXT CHECK(role IN ('citoyen', 'autorité')) NOT NULL
                        )
                    `);
                    testDb.run(`
                        CREATE TABLE IF NOT EXISTS Incidents (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            type TEXT NOT NULL,
                            description TEXT,
                            localisation TEXT NOT NULL,
                            statut TEXT CHECK(statut IN ('en cours', 'résolu', 'annulé')) DEFAULT 'en cours',
                            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )
                    `);
                    done();
                });
            }
        });
    });

    // Après chaque test, ferme la base de données
    afterEach((done) => {
        testDb.close((err) => {
            if (err) {
                console.error('Erreur lors de la fermeture de la base de données :', err.message);
                done(err);
            } else {
                console.log('Base de données en mémoire fermée.');
                done();
            }
        });
    });

    // Test : Ajouter un utilisateur
    test('Ajout d\'un utilisateur dans la table Utilisateurs', (done) => {
        const query = `INSERT INTO Utilisateurs (nom, email, role) VALUES (?, ?, ?)`;
        const values = ['Jean Dupont', 'jean@example.com', 'citoyen'];

        testDb.run(query, values, function (err) {
            expect(err).toBeNull();
            expect(this.lastID).toBeGreaterThan(0); // Vérifie que l'utilisateur a été ajouté
            done();
        });
    });

    // Test : Récupérer tous les utilisateurs
    test('Récupération des utilisateurs depuis la table Utilisateurs', (done) => {
        const queryInsert = `INSERT INTO Utilisateurs (nom, email, role) VALUES (?, ?, ?)`;
        const querySelect = `SELECT * FROM Utilisateurs`;

        testDb.run(queryInsert, ['Jean Dupont', 'jean@example.com', 'citoyen'], function () {
            testDb.all(querySelect, [], (err, rows) => {
                expect(err).toBeNull();
                expect(rows.length).toBe(1); // Vérifie qu'un utilisateur est présent
                expect(rows[0].nom).toBe('Jean Dupont');
                done();
            });
        });
    });

    // Test : Ajouter un incident
    test('Ajout d\'un incident dans la table Incidents', (done) => {
        const query = `INSERT INTO Incidents (type, description, localisation) VALUES (?, ?, ?)`;
        const values = ['Feu', 'Un feu a été signalé près du parc.', '45.1234, -73.5678'];

        testDb.run(query, values, function (err) {
            expect(err).toBeNull();
            expect(this.lastID).toBeGreaterThan(0); // Vérifie que l'incident a été ajouté
            done();
        });
    });

    // Test : Récupérer tous les incidents
    test('Récupération des incidents depuis la table Incidents', (done) => {
        const queryInsert = `INSERT INTO Incidents (type, description, localisation) VALUES (?, ?, ?)`;
        const querySelect = `SELECT * FROM Incidents`;

        testDb.run(queryInsert, ['Feu', 'Un feu a été signalé près du parc.', '45.1234, -73.5678'], function () {
            testDb.all(querySelect, [], (err, rows) => {
                expect(err).toBeNull();
                expect(rows.length).toBe(1); // Vérifie qu'un incident est présent
                expect(rows[0].type).toBe('Feu');
                done();
            });
        });
    });
});
