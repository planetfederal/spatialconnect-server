--  Copyright 2016-2017 Boundless, http://boundlessgeo.com
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

DROP TABLE IF EXISTS spacon.organizations CASCADE;
DROP TRIGGER IF EXISTS update_updated_at_organizations ON spacon.organizations;
DROP TABLE IF EXISTS spacon.teams CASCADE;
DROP TRIGGER IF EXISTS update_updated_at_teams ON spacon.teams;
DROP TABLE IF EXISTS spacon.stores CASCADE;
DROP TRIGGER IF EXISTS update_updated_at_stores ON spacon.stores;
DROP TABLE IF EXISTS spacon.forms CASCADE;
DROP TRIGGER IF EXISTS update_updated_at_forms ON spacon.forms;
DROP TABLE IF EXISTS spacon.devices CASCADE;
DROP TRIGGER IF EXISTS update_updated_at_devices ON spacon.devices;
DROP TABLE IF EXISTS spacon.device_locations CASCADE;
DROP TRIGGER IF EXISTS update_updated_at_device_locations ON spacon.device_locations;
DROP TABLE IF EXISTS spacon.form_data CASCADE;
DROP TRIGGER IF EXISTS update_updated_at_form_data ON spacon.form_data;
DROP TABLE IF EXISTS spacon.form_fields CASCADE;
DROP TRIGGER IF EXISTS update_updated_at_form_fields ON spacon.form_fields;
DROP TABLE IF EXISTS spacon.user_team CASCADE;
DROP TABLE IF EXISTS spacon.users CASCADE;
DROP TYPE IF EXISTS form_type;
DROP TRIGGER IF EXISTS update_updated_at_users ON spacon.users;
DROP TABLE IF EXISTS spacon.triggers;
DROP TRIGGER IF EXISTS update_updated_at_triggers ON spacon.triggers;
DROP FUNCTION IF EXISTS update_updated_at_column();

