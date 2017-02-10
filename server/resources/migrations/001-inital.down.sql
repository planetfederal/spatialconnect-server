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

DROP TABLE IF EXISTS organizations CASCADE;
DROP TRIGGER IF EXISTS update_updated_at_organizations ON organizations;
DROP TABLE IF EXISTS teams CASCADE;
DROP TRIGGER IF EXISTS update_updated_at_teams ON teams;
DROP TABLE IF EXISTS stores CASCADE;
DROP TRIGGER IF EXISTS update_updated_at_stores ON stores;
DROP TABLE IF EXISTS forms CASCADE;
DROP TRIGGER IF EXISTS update_updated_at_forms ON forms;
DROP TABLE IF EXISTS devices CASCADE;
DROP TRIGGER IF EXISTS update_updated_at_devices ON devices;
DROP TABLE IF EXISTS device_locations CASCADE;
DROP TRIGGER IF EXISTS update_updated_at_device_locations ON device_locations;
DROP TABLE IF EXISTS form_data CASCADE;
DROP TRIGGER IF EXISTS update_updated_at_form_data ON form_data;
DROP TABLE IF EXISTS form_fields CASCADE;
DROP TRIGGER IF EXISTS update_updated_at_form_fields ON form_fields;
DROP TABLE IF EXISTS user_team CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS form_type;
DROP TRIGGER IF EXISTS update_updated_at_users ON users;
DROP TABLE IF EXISTS triggers;
DROP TRIGGER IF EXISTS update_updated_at_triggers ON triggers;
DROP FUNCTION IF EXISTS update_updated_at_column();

