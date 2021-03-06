const express = require('express');
const cors = require('cors')

const config = require('./config');
const db = require('./db');
const importer = require('./importer');

const app = express();
app.use(cors())

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

app.listen(config.port, () => {
    console.log('annuaire sante as api is listening on port ' + config.port + ' !');
})