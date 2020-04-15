const fs = require('fs');
const request = require('request');
const yauzl = require('yauzl');
const csvParse = require('csv-parse');

const config = require('./config');
const db = require('./db');

var status = '';

const download = () => {
    return new Promise((resolve, reject) => {
        status = 'downloading';
        console.log('Create tmp folder');
        fs.mkdirSync('tmp', { recursive: true });

        console.log('Download database');
        var outputFile = 'tmp/db.zip';
        request({
            url: config.annuaire_sante_url,
            method: 'GET',
            agentOptions: {
                rejectUnauthorized: false // install certificate from http://igc-sante.esante.gouv.fr/PC/#ca to don't do that
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
                        .on('end', () => {
                            resolve(outputFile);
                        })
                        .pipe(fs.createWriteStream(outputFile))
                    });
                } else {
                    zipfile.readEntry();
                }
            })
        });
    });
}

function parseAndInsert(csv) {
    status = 'inserting';
    console.log('Read csv ' + csv + ' and inject');
    
    var csvData = [];
    var parser = csvParse({
        delimiter: '|',
        from_line: 2,
        relax: true
    });

    fs.createReadStream(csv)
        .on('error', console.log)
        .pipe(parser)
        .on('data', async (csvrow) => {

            csvData.push(csvrow.map(function (value, label) {
                return value.replace(/\\xC2\\x92/g, '').replace(/""/g, '"');
            }));
            
            if(csvData.length == 100) {
                parser.pause();

                await db.insert([csvData]).catch(console.log);
                csvData = [];

                parser.resume();
            }
        })
        .on('end', async () => {
            
            await db.insert([csvData]).catch(console.log);
            csvData = [];

            console.log('end');
            status = 'finished';
        });
}

module.exports = {
    getStatus: () => {
        return status;
    },
    launch: () => {
        download()
        .then(unzip)
        .then(parseAndInsert)
    }
};