
-- name: device-locations
-- counts the number of devices
SELECT dl.x AS x,
    dl.y AS y,
    dl.z AS z,
    dl.updated_at AS updated_at,
    d.identifier AS identifier,
    d.device_info AS device_info
FROM device_locations dl JOIN devices d ON d.id = dl.device_id;