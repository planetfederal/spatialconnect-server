ALTER TABLE stores RENAME default_layer TO default_layers;
ALTER TABLE stores ALTER default_layers DROP DEFAULT;
ALTER TABLE stores ALTER default_layers TYPE TEXT[] using array[default_layers];
