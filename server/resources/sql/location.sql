-- name: device-locations
-- counts the number of devices
SELECT ST_AsText(geom) AS geom,
    dl.updated_at AS updated_at,
    d.identifier AS identifier,
    d.device_info AS device_info
FROM spacon.device_locations dl JOIN spacon.devices d ON d.id = dl.device_id;

-- name: upsert-location!
-- updates a devices location
INSERT INTO spacon.device_locations(geom,updated_at,device_id) VALUES
(ST_GeometryFromText(:geom),NOW(),(SELECT id FROM spacon.devices WHERE identifier = :identifier))
ON CONFLICT (device_id) DO UPDATE SET
geom = ST_GeometryFromText(:geom), updated_at = NOW()
WHERE device_locations.device_id = (SELECT id FROM spacon.devices WHERE identifier = :identifier);
