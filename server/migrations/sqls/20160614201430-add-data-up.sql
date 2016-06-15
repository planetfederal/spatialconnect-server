INSERT INTO stores (name,store_type,version,uri,id) VALUES ('gj1','geojson','1','simple.geojson','3dc5afc9-393b-444c-8581-582e2c2d98a3');
INSERT INTO stores (name,store_type,version,uri,id) VALUES ('gj2','geojson','1','feature.geojson','3e6c072e-8e62-41be-8d1a-7a3116df9c16');
INSERT INTO stores (name,store_type,version,uri,id) VALUES ('gpkg1','gpkg','1','http://www.geopackage.org/data/haiti-vectors-split.gpkg','f6dcc750-1349-46b9-a324-0223764d46d1');
INSERT INTO stores (name,store_type,version,uri,id) VALUES ('gpkg2','gpkg','1','https://portal.opengeospatial.org/files/63156','fad33ae1-f529-4c79-affc-befc37c104ae');
INSERT INTO devices (name,identifier) VALUES ('iphone','afsasdfasdfasdfsf');
INSERT INTO devices (name,identifier) VALUES ('android',';ljljlkjljljljlkj');
INSERT INTO forms (name) VALUES ('Weed Inspector');

INSERT INTO form_field (id,form_id,position,key,label,type,is_integer,is_required)
VALUES ('1a64a430-2383-11e6-8e69-199a71acc918',(SELECT id FROM forms WHERE name = 'Weed Inspector'),0,'weed_stage','Weed Stage','number',false,true);

INSERT INTO form_field (id,form_id,position,key,label,type,initial_value)
VALUES ('3ee19d40-2383-11e6-8e69-199a71acc918',(SELECT id FROM forms WHERE name = 'Weed Inspector'),1,'number_of_plants','Number of Plants','counter','0');

INSERT INTO form_field (id,form_id,position,key,label,type,minimum,maximum,initial_value)
VALUES ('51cce810-2383-11e6-8e69-199a71acc918',(SELECT id FROM forms WHERE name = 'Weed Inspector'),2,'infestation_size','Infestation Size','slider','0','100','0');

INSERT INTO form_field (id,form_id,position,key,label,type,minimum,initial_value,is_required)
VALUES ('6207b8e0-2383-11e6-8e69-199a71acc918',(SELECT id FROM forms WHERE name = 'Weed Inspector'),3,'degree','Degree','counter','0','0',true);

INSERT INTO form_field (id,form_id,position,key,label,type,minimum,maximum,initial_value)
VALUES ('6af26fe0-2383-11e6-8e69-199a71acc918',(SELECT id FROM forms WHERE name = 'Weed Inspector'),4,'density','Density','slider','0','100','0');

INSERT INTO form_field (id,form_id,position,key,label,type,pattern,is_required)
VALUES ('783cb070-2383-11e6-8e69-199a71acc918',(SELECT id FROM forms WHERE name = 'Weed Inspector'),5,'source','Source','string','',true);

INSERT INTO form_field (id,form_id,position,key,label,type)
VALUES ('7d99faf0-2383-11e6-8e69-199a71acc918',(SELECT id FROM forms WHERE name = 'Weed Inspector'),6,'date_discovered','Data Discovered','date');

INSERT INTO form_field (id,form_id,position,key,label,type,pattern,is_required)
VALUES ('93a71f30-2383-11e6-936f-09fad98df2dc',(SELECT id FROM forms WHERE name = 'Weed Inspector'),7,'common_name','Common Name','string','',true);

INSERT INTO form_field (id,form_id,position,key,label,type,pattern,is_required)
VALUES ('9a686680-2383-11e6-936f-09fad98df2dc',(SELECT id FROM forms WHERE name = 'Weed Inspector'),8,'genus','Genus','string','',true);

INSERT INTO form_field (id,form_id,position,key,label,type,pattern)
VALUES ('9f2d1a80-2383-11e6-936f-09fad98df2dc',(SELECT id FROM forms WHERE name = 'Weed Inspector'),9,'species','Species','string','');

INSERT INTO form_field (id,form_id,position,key,label,type,pattern)
VALUES ('a4dd8e10-2383-11e6-936f-09fad98df2dc',(SELECT id FROM forms WHERE name = 'Weed Inspector'),10,'scientific_name','Scientific Name','string','');

INSERT INTO form_field (id,form_id,position,key,label,type,pattern)
VALUES ('af68d5b0-2383-11e6-936f-09fad98df2dc',(SELECT id FROM forms WHERE name = 'Weed Inspector'),11,'class','Class','string','');

INSERT INTO forms (name) VALUES ('Baseball Team');

INSERT INTO form_field (id,form_id,position,key,label,type)
VALUES ('a214590d-8673-420b-8bca-aa2877b45c52',(SELECT id FROM forms WHERE name = 'Baseball Team'),0,'team','Favorite?','string');

INSERT INTO form_field (id,form_id,position,key,label,type)
VALUES ('2a0d1d9b-a44c-44c2-9ea3-9ecd093d9fa6',(SELECT id FROM forms WHERE name = 'Baseball Team'),1,'why','Why?','string');
