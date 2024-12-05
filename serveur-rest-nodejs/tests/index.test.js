const request = require('supertest');
const express = require('express');
const { initDB } = require('../database');
const app = require('../index'); // Importer le serveur

// Initialiser la base de données avant les tests
beforeAll(() => {
    initDB();
});

// Test de l'endpoint GET /
describe('Test du serveur REST', () => {
    test('GET / - Vérifier que le serveur répond', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Serveur en marche !');
    });

    // Test POST /utilisateurs
    test('POST /utilisateurs - Ajouter un utilisateur', async () => {
        const utilisateur = {
            nom: 'Jean Dupont',
            email: 'jean@example.com',
            role: 'citoyen',
        };

        const response = await request(app).post('/utilisateurs').send(utilisateur);
        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('Utilisateur ajouté.');
    });

    // Test GET /utilisateurs
    test('GET /utilisateurs - Récupérer la liste des utilisateurs', async () => {
        const response = await request(app).get('/utilisateurs');
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('nom', 'Jean Dupont');
    });

    // Test POST /incidents
    test('POST /incidents - Ajouter un incident', async () => {
        const incident = {
            type: 'Feu',
            description: 'Un feu a été signalé près du parc.',
            localisation: '45.1234, -73.5678',
        };

        const response = await request(app).post('/incidents').send(incident);
        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('Incident ajouté.');
    });

    // Test GET /incidents
    test('GET /incidents - Récupérer la liste des incidents', async () => {
        const response = await request(app).get('/incidents');
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('type', 'Feu');
    });
});
