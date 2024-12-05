const express = require('express');
const bodyParser = require('body-parser');
const {
    initDB,
    ajouterUtilisateur,
    verifierUtilisateurParTelephone,
    loginUtilisateur,
    ajouterIncident,
    recupererIncidents,
} = require('./database');

const app = express();
const PORT = 3000;

// Middleware pour parser les requêtes JSON
app.use(bodyParser.json());

// Initialiser la base de données
initDB();

// Route : Ajouter un utilisateur
app.post('/utilisateurs', (req, res) => {
    const { telephone, nom, prenom, mot_de_passe, role } = req.body;

    if (!telephone || !nom || !prenom || !mot_de_passe || !role) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    verifierUtilisateurParTelephone(telephone, (err, exists) => {
        if (err) return res.status(500).json({ error: 'Erreur lors de la vérification.' });

        if (exists) {
            return res.status(400).json({ error: 'Utilisateur existe déjà.' });
        }

        ajouterUtilisateur(telephone, nom, prenom, mot_de_passe, role, (err, id) => {
            if (err) return res.status(500).json({ error: 'Erreur lors de l’ajout de l’utilisateur.' });

            res.status(201).json({ message: 'Utilisateur ajouté.', telephone: id });
        });
    });
});

// Route : Login utilisateur
app.post('/utilisateurs/login', (req, res) => {
    const { telephone, mot_de_passe } = req.body;

    if (!telephone || !mot_de_passe) {
        return res.status(400).json({ error: 'Téléphone et mot de passe sont requis.' });
    }

    loginUtilisateur(telephone, mot_de_passe, (err, id) => {
        if (err) return res.status(400).json({ error: err.message });

        res.status(200).json({ message: 'Connexion réussie.', telephone: id });
    });
});

// Route : Ajouter un incident
app.post('/incidents', (req, res) => {
    const { categorie, coordonnees, description, auteur_id, photo } = req.body;

    if (!categorie || !coordonnees || !description || !auteur_id) {
        return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis.' });
    }

    ajouterIncident(categorie, coordonnees, description, auteur_id, photo, (err, id) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de l’ajout de l’incident.' });
        }

        res.status(201).json({ message: 'Incident ajouté.', id });
    });
});

// Route : Récupérer les incidents
app.get('/incidents', (req, res) => {
    const { utilisateur, categorie, date } = req.query;

    recupererIncidents({ utilisateur, categorie, date }, (err, incidents) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des incidents.' });
        }

        res.status(200).json(incidents);
    });
});

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
