ALTER TABLE stores ADD COLUMN default_layer TEXT;

INSERT INTO stores (name,store_type,version,uri,id,default_layer) VALUES ('wfstest','wfs','1.1.0','http://efc-dev.boundlessgeo.com:8080/geoserver/spatialconnect/ows','71522e9b-3ec6-48c3-8d5c-57c8d14baf6a','baseball_team');

INSERT INTO users (name,email,password) VALUES ('Admin Person','admin@something.com','$2a$10$j57V/gWt9UR3wRzUC7ddye9Nhp4SWJVMm2o.lCBQe2IeE6ETztqGy');
