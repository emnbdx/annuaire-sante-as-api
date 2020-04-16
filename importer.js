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
        console.log('Download database');

        fs.mkdirSync('tmp', { recursive: true });
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

const countLines = function(filePath, callback) {
    let i;
    let count = 0;
    fs.createReadStream(filePath)
        .on('error', e => callback(e))
        .on('data', chunk => {
            for (i=0; i < chunk.length; ++i) if (chunk[i] == 10) count++;
        })
        .on('end', () => callback(null, count));
};

function parseAndInsert(csv) {
    status = 'inserting';
    console.log('Read csv ' + csv + ' and inject');
    
    var csvData = [];
    var parser = csvParse({
        delimiter: '|',
        from_line: 2,
        relax: true
    });

    countLines(csv, (err, lineCount) => {
        if(err) throw err;

        fs.createReadStream(csv)
            .on('error', console.log)
            .pipe(parser)
            .on('data', async (csvrow) => {

                // Filter on profession code
                if(config.import_filter.length > 0 && !config.import_filter.includes(parseInt(csvrow[9]))) {
                    return;
                }

                // I don't know why but there is one extra column in file
                csvrow.pop();

                // Remove invalid char and parse error
                csvData.push(csvrow.map(function (value, label) {
                    return value.replace(/\\xC2\\x92/g, '').replace(/""/g, '"');
                }));
                
                if(csvData.length == 100) {
                    parser.pause();

                    await db.insert([csvData]).catch(console.log);
                    csvData = [];

                    // update state
                    const {lines} = parser.info;
                    status = 'inserting ' + Math.round((lines * 100 / lineCount)) + '%';

                    parser.resume();
                }
            })
            .on('end', async () => {
                
                if(csvData.length > 0) {
                    await db.insert([csvData]).catch(console.log);
                    csvData = [];
                }

                status = 'finished';
                console.log('Finished');
            });
    })    
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