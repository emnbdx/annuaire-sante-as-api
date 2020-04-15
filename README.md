# annuaire-sante-as-api

## What is that ?

This node.js application import data from https://annuaire.sante.fr/ to mysql database and provide API to query data

Documentation of annuaire sante webservice can be found here : https://esante.gouv.fr/sites/default/files/media_entity/documents/Annuaire_sante_fr_DSFT_Extractions_donnees_libre%20acces_V2.2.1.pdf

## How to run

Create schema on your mysql server with `schema.sql`

install dependencies:

`yarn install`

And finally run:

`yarn dev`

## How to use

This application provide 3 endpoint (so sorry no swagger) :
|METHOD|ENDPOINT|ACTION|
|-|-|-|
|GET |/|Can be used with lastname param to query data|
|POST| /update|Launch import of data|
|GET |/update-status|Get import status|