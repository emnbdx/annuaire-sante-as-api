const express = require('express');

const db = require('./db');
const importer = require('./importer');

const app = express();

app.get('/', async (req, res) => {
    var resutl = await db.select(req.query.lastname).catch(console.log);
    res.json(resutl);
})

app.post('/update', (_req, res) => {
    importer.launch();

    res.send('Update task launched, get status with GET /update-state endpoint');
})

app.get('/update-state', (_req, res) => {
    res.json({status : importer.getStatus()});
})

app.listen(3000, () => {
    console.log('annuaire sante as api is listening on port 3000!');
})