const express = require('express');

const db = require('./db');
const importer = require('./importer');

const app = express();

app.get('/', async (req, res) => {
    var resutl = await db.select(req.query).catch(console.log);
    res.json(resutl);
})

app.post('/update', (_req, res) => {
    importer.launch();

    res.send('Update task launched, get status with GET /update-status endpoint');
})

app.get('/update-status', (_req, res) => {
    res.json({status : importer.getStatus()});
})

app.listen(3000, () => {
    console.log('annuaire sante as api is listening on port 3000!');
})