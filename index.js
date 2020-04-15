const express = require('express');
const fs = require('fs');
const request = require('request');
const yauzl = require('yauzl');
const csvParse = require('csv-parse');
const mysql = require('mysql');

const app = express();

app.get('/', (req, res) => {
    connection.connect(function(err) {
    
        connection.query("SELECT * FROM annuaire_sante WHERE lastname like '" + req.query.lastname + "%' LIMIT 5", function (err, result, fields) {
            if (err) throw err;
            res.send(result)
        });

    });
})

app.post('/update', (req, res) => {
    download()
    .then(unzip)
    .then(parseAndInsert)

    res.send('Update task launch, get status with /update-state endpoint')
})

app.get('/update-state', (req, res) => {
    res.send({status : status})
})

app.listen(3000, () => {
    console.log('annuaire sante as api is listening on port 3000!')
})

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: null,
    database: 'db'
});

var status = '';

const download = () => {
    return new Promise((resolve, reject) => {
        status = 'downloading';
        console.log('Create tmp folder');
        fs.mkdirSync('tmp', { recursive: true });

        console.log('Download database');
        var outputFile = 'tmp/db.zip';
        request({
            url: 'https://service.annuaire.sante.fr/annuaire-sante-webservices/V300/services/extraction/PS_LibreAcces',
            method: 'GET',
            agentOptions: {
                rejectUnauthorized: false
            }
        })
        .pipe(fs.createWriteStream(outputFile))
        .on('finish', () => {
            resolve(outputFile);
        })
        .on('error', reject);
    });
};

const unzip = (file) => {
    return new Promise((resolve, reject) => {
        status = 'unziping';
        console.log('Unzip database');
        var outputFile = 'tmp/db.txt';
        yauzl.open(file, {lazyEntries: true}, (err, zipfile) => {
            if (err) reject;
            zipfile.readEntry();
            zipfile.on('entry', (entry) => {
                if (/^PS_LibreAcces_Personne_activite_/.test(entry.fileName)) {                
                    zipfile.openReadStream(entry, (err, readStream) => {
                        if (err) throw reject;
                        readStream
                        .pipe(fs.createWriteStream(outputFile))
                        .on('end', () => {
                            zipfile.readEntry();
                        })
                    });
                } else {
                    zipfile.readEntry();
                }
            })
        });
        resolve(outputFile);
    });
}

function parseAndInsert(csv) {
    status = 'inserting';
    // Read csv and inject in db
    console.log('Read csv ' + csv + ' and inject');
    
    connection.connect(function(err) {
        if (err) throw err;
    
        var csvData = [];
        var parser = csvParse({
            delimiter: '|',
            from_line: 2,
            relax: true
        });

        fs.createReadStream(csv)
            .pipe(parser)
            .on('data', (csvrow) => {
                csvData.push(csvrow.map(function (value, label) {
                    return value.replace(/\\xC2\\x92/g, '').replace(/""/g, '"');
                }));
                
                if(csvData.length == 100) {
                    parser.pause();

                    var query = 'INSERT INTO annuaire_sante (id_type, id, id_nat, civility_practice_code, civility_practice_label, civility_code, civility_label, firstname, lastname, profession_code, profession_label, professional_category_code, professional_category_label, know_how_type_code, know_how_type_label, know_how_code, know_how_label, practice_mode_code, practice_mode_label, siren_number, siret_number, finess_number, finess_legal_number, technical_id, company_name, commercial_sign, recipient_supplement, geographic_point_supplement, street_number, street_repeat_index, street_type_code, street_type_label, street_label, distribution_mention, cedex_office, zip_code, town_code, town_label, country_code, country_label, phone, phone2, fax, email, county_code, county_label, old_id, registration_authority, sector_code, sector_label, pharmacists_table_section_code, pharmacists_table_section_label, unknow) VALUES ?';
                    connection.query(query, [csvData], (err, response) => {
                        if(err) console.log(err);
                        csvData = [];
                        parser.resume();
                    });
                }
            })
            .on('error', console.log)
            .on('end', () => {
                var query = 'INSERT INTO annuaire_sante (id_type, id, id_nat, civility_practice_code, civility_practice_label, civility_code, civility_label, firstname, lastname, profession_code, profession_label, professional_category_code, professional_category_label, know_how_type_code, know_how_type_label, know_how_code, know_how_label, practice_mode_code, practice_mode_label, siren_number, siret_number, finess_number, finess_legal_number, technical_id, company_name, commercial_sign, recipient_supplement, geographic_point_supplement, street_number, street_repeat_index, street_type_code, street_type_label, street_label, distribution_mention, cedex_office, zip_code, town_code, town_label, country_code, country_label, phone, phone2, fax, email, county_code, county_label, old_id, registration_authority, sector_code, sector_label, pharmacists_table_section_code, pharmacists_table_section_label, unknow) VALUES ?';
                connection.query(query, [csvData], (err, response) => {
                    if(err) console.log(err);
                    csvData = [];
                });

                console.log('end');
                status = 'finished';
            });
    });
}