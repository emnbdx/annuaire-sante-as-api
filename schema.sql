CREATE SCHEMA db;

use db;

CREATE TABLE annuaire_sante (
    id_type varchar(255),
    id varchar(255),
    id_nat varchar(255),
    civility_practice_code varchar(255),
    civility_practice_label varchar(255),
    civility_code varchar(255),
    civility_label varchar(255),
    lastname varchar(60),
    firstname varchar(60),
    profession_code varchar(255),
    profession_label varchar(255),
    professional_category_code varchar(255),
    professional_category_label varchar(255),
    know_how_type_code varchar(255),
    know_how_type_label varchar(255),
    know_how_code varchar(255),
    know_how_label varchar(255),
    practice_mode_code varchar(255),
    practice_mode_label varchar(255),
    siren_number varchar(14),
    siret_number varchar(9),
    finess_number varchar(9),
    finess_legal_number varchar(9),
    technical_id varchar(255),
    company_name varchar(164),
    commercial_sign varchar(50),
    recipient_supplement varchar(38),
    geographic_point_supplement varchar(38),
    street_number varchar(5),
    street_repeat_index varchar(3),
    street_type_code varchar(255),
    street_type_label varchar(255),
    street_label varchar(38),
    distribution_mention varchar(38),
    cedex_office varchar(38),
    zip_code varchar(5),
    town_code varchar(255),
    town_label varchar(255),
    country_code varchar(255),
    country_label varchar(255),
    phone varchar(15),
    phone2 varchar(15),
    fax varchar(15),
    email varchar(512),
    county_code varchar(255),
    county_label varchar(255),
    old_id varchar(15),
    registration_authority varchar(255),
    sector_code varchar(255),
    sector_label varchar(255),
    pharmacists_table_section_code varchar(255),
    pharmacists_table_section_label varchar(255),
    unknow varchar(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;