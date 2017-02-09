--  Copyright  Copyright 2016-2017 Boundless, http://boundlessgeo.com
--
--  Licensed under the Apache License, Version 2.0 (the "License");
--  you may not use this file except in compliance with the License.
--  You may obtain a copy of the License at
--
--  http://www.apache.org/licenses/LICENSE-2.0
--
--  Unless required by applicable law or agreed to in writing, software
--  distributed under the License is distributed on an "AS IS" BASIS,
--  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
--  See the License for the specific language governing permissions and
--  limitations under the License.

-- name: device-locations
-- counts the number of devices
SELECT ST_AsText(geom) AS geom,
    dl.updated_at AS updated_at,
    d.identifier AS identifier,
    d.device_info AS device_info
FROM device_locations dl JOIN devices d ON d.id = dl.device_id;

-- name: upsert-location!
-- updates a devices location
INSERT INTO device_locations(geom,updated_at,device_id) VALUES
(ST_GeometryFromText(:geom),NOW(),(SELECT id FROM devices WHERE identifier = :identifier))
ON CONFLICT (device_id) DO UPDATE SET
geom = ST_GeometryFromText(:geom), updated_at = NOW()
WHERE device_locations.device_id = (SELECT id FROM devices WHERE identifier = :identifier);
