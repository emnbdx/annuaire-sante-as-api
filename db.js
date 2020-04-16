const mysql = require('mysql');

const config = require('./config');

connection = mysql.createConnection(config.connection);

var exports = module.exports = {};

exports.select = async (query) => new Promise(
    (resolve, reject) => {
        const handler = (error, result) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(result);
        }

        var clause = '';
        Object.keys(query).forEach(function(key) {
            var val = query[key];
            if(clause == '') {
                clause += 'WHERE ';
            } else {
                clause += ' AND ';
            }
            clause += key + " like '" + val + "%'";
        });

        connection.query('SELECT * FROM annuaire_sante ' + clause + ' LIMIT 5', handler);
    });

exports.insert = async (data) => new Promise(
    (resolve, reject) => {
        const handler = (error, result) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(result);
        }
        connection.query('INSERT INTO annuaire_sante (id_type, id, id_nat, civility_practice_code, civility_practice_label, civility_code, civility_label, lastname, firstname, profession_code, profession_label, professional_category_code, professional_category_label, know_how_type_code, know_how_type_label, know_how_code, know_how_label, practice_mode_code, practice_mode_label, siren_number, siret_number, finess_number, finess_legal_number, technical_id, company_name, commercial_sign, recipient_supplement, geographic_point_supplement, street_number, street_repeat_index, street_type_code, street_type_label, street_label, distribution_mention, cedex_office, zip_code, town_code, town_label, country_code, country_label, phone, phone2, fax, email, county_code, county_label, old_id, registration_authority, sector_code, sector_label, pharmacists_table_section_code, pharmacists_table_section_label) VALUES ?', data, handler);
    });