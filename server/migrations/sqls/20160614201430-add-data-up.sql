INSERT INTO stores (name,store_type,version,uri,id) VALUES ('bars','geojson','1','https://s3.amazonaws.com/test.spacon/bars.geojson','3dc5afc9-393b-444c-8581-582e2c2d98a3');
INSERT INTO stores (name,store_type,version,uri,id) VALUES ('gj2','geojson','1','feature.geojson','3e6c072e-8e62-41be-8d1a-7a3116df9c16');
INSERT INTO stores (name,store_type,version,uri,id) VALUES ('Rio','gpkg','1','https://s3.amazonaws.com/test.spacon/rio.gpkg"','f6dcc750-1349-46b9-a324-0223764d46d1');
INSERT INTO stores (name,store_type,version,uri,id) VALUES ('Whitehorse','gpkg','1','https://portal.opengeospatial.org/files/63156','fad33ae1-f529-4c79-affc-befc37c104ae');
INSERT INTO forms (form_key,form_label) VALUES ('weed_inspector','Weed Inspector');

INSERT INTO form_fields (form_id,position,field_key,field_label,type,is_integer,is_required)
VALUES ((SELECT id FROM forms WHERE form_key = 'weed_inspector'),0,'weed_stage','Weed Stage','number',false,true);

INSERT INTO form_fields (form_id,position,field_key,field_label,type,initial_value)
VALUES ((SELECT id FROM forms WHERE form_key = 'weed_inspector'),1,'number_of_plants','Number of Plants','counter','0');

INSERT INTO form_fields (form_id,position,field_key,field_label,type,minimum,maximum,initial_value)
VALUES ((SELECT id FROM forms WHERE form_key = 'weed_inspector'),2,'infestation_size','Infestation Size','slider','0','100','0');

INSERT INTO form_fields (form_id,position,field_key,field_label,type,minimum,initial_value,is_required)
VALUES ((SELECT id FROM forms WHERE form_key = 'weed_inspector'),3,'degree','Degree','counter','0','0',true);

INSERT INTO form_fields (form_id,position,field_key,field_label,type,minimum,maximum,initial_value)
VALUES ((SELECT id FROM forms WHERE form_key = 'weed_inspector'),4,'density','Density','slider','0','100','0');

INSERT INTO form_fields (form_id,position,field_key,field_label,type,pattern,is_required)
VALUES ((SELECT id FROM forms WHERE form_key = 'weed_inspector'),5,'source','Source','string','',true);

INSERT INTO form_fields (form_id,position,field_key,field_label,type)
VALUES ((SELECT id FROM forms WHERE form_key = 'weed_inspector'),6,'date_discovered','Data Discovered','date');

INSERT INTO form_fields (form_id,position,field_key,field_label,type,pattern,is_required)
VALUES ((SELECT id FROM forms WHERE form_key = 'weed_inspector'),7,'common_name','Common Name','string','',true);

INSERT INTO form_fields (form_id,position,field_key,field_label,type,pattern,is_required)
VALUES ((SELECT id FROM forms WHERE form_key = 'weed_inspector'),8,'genus','Genus','string','',true);

INSERT INTO form_fields (form_id,position,field_key,field_label,type,pattern)
VALUES ((SELECT id FROM forms WHERE form_key = 'weed_inspector'),9,'species','Species','string','');

INSERT INTO form_fields (form_id,position,field_key,field_label,type,pattern)
VALUES ((SELECT id FROM forms WHERE form_key = 'weed_inspector'),10,'scientific_name','Scientific Name','string','');

INSERT INTO form_fields (form_id,position,field_key,field_label,type,pattern)
VALUES ((SELECT id FROM forms WHERE form_key = 'weed_inspector'),11,'class','Class','string','');

INSERT INTO forms (form_key,form_label) VALUES ('baseball_team','Baseball Team');

INSERT INTO form_fields (form_id,position,field_key,field_label,type)
VALUES ((SELECT id FROM forms WHERE form_key = 'baseball_team'),0,'team','Favorite?','string');

INSERT INTO form_fields (form_id,position,field_key,field_label,type)
VALUES ((SELECT id FROM forms WHERE form_key = 'baseball_team'),1,'why','Why?','string');

INSERT INTO stores (name,store_type,version,uri,id,default_layers) VALUES ('wfstest','wfs','1.1.0','http://efc-dev.boundlessgeo.com:8080/geoserver/spatialconnect/ows','71522e9b-3ec6-48c3-8d5c-57c8d14baf6a','{"baseball_team"}');

INSERT INTO users (name,email,password) VALUES ('Admin Person','admin@something.com','$2a$10$j57V/gWt9UR3wRzUC7ddye9Nhp4SWJVMm2o.lCBQe2IeE6ETztqGy');
INSERT INTO users (name,email,password) VALUES ('Easy admin','a','$2a$10$3F76hRYXoxS4EZ8jgGY8auzLRWZb.UWbMY5b41Zrt7Nqb3c1NShlW');
