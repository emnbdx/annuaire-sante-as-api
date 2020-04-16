var config = {};

config.annuaire_sante_url = 'https://service.annuaire.sante.fr/annuaire-sante-webservices/V300/services/extraction/PS_LibreAcces';

config.port = process.env.PORT || 3000;

config.connection = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || 'db'
};

// This array allow you to filter profession to insert in case you don't want to import whole file
// If empty ingored
// Else can contain these values
// 10 : Médecin
// 21 : Pharmacien
// 26 : Audioprothésiste
// 28 : Opticien-Lunetier
// 40 : Chirurgien-Dentiste
// 50 : Sage-Femme
// 60 : Infirmier
// 70 : Masseur-Kinésithérapeute
// 80 : Pédicure-Podologue
// 81 : Orthoprothésiste
// 82 : Podo-Orthésiste
// 83 : Orthopédiste-Orthésiste
// 84 : Oculariste
// 85 : Epithésiste
// 86 : Technicien de laboratoire médical
// 91 : Orthophoniste
// 92 : Orthoptiste
// 94 : Ergothérapeute
// 95 : Diététicien
// 96 : Psychomotricien
// 98 : Manipulateur ERM
config.import_filter = [];

module.exports = config;