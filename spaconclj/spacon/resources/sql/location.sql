
-- name: device-locations
-- counts the number of devices
SELECT dl.x AS x,
    dl.y AS y,
    dl.z AS z,
    dl.updated_at AS updated_at,
    d.identifier AS identifier,
    d.device_info AS device_info
FROM device_locations dl JOIN devices d ON d.id = dl.device_id;

-- name: upsert-location!
-- updates a devices location
INSERT INTO device_locations(x,y,z,updated_at,device_id) VALUES
(:x,:y,:z,NOW(),(SELECT id FROM devices WHERE identifier = :device_id))
ON CONFLICT (device_id) DO UPDATE SET
x = :x, y = :y, z = :z, updated_at = NOW()
WHERE device_locations.device_id = (SELECT id FROM devices WHERE identifier = :device_id);
