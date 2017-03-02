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

--CREATE EXTENSION IF NOT EXISTS pgcrypto;
--CREATE EXTENSION IF NOT EXISTS postgis;

CREATE SCHEMA IF NOT EXISTS spacon;
SET search_path=spacon,public;

CREATE OR REPLACE FUNCTION spacon.update_updated_at_column()
        RETURNS TRIGGER AS '
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
' LANGUAGE 'plpgsql';

CREATE TABLE IF NOT EXISTS spacon.organizations
(
   id serial PRIMARY KEY,
   name TEXT,
   created_at timestamp DEFAULT NOW(),
   updated_at timestamp DEFAULT NOW(),
   deleted_at timestamp with time zone
)
WITH (
   OIDS=FALSE
);

CREATE TRIGGER update_updated_at_organizations
    BEFORE UPDATE ON spacon.organizations FOR EACH ROW EXECUTE
    PROCEDURE spacon.update_updated_at_column();

CREATE TABLE IF NOT EXISTS spacon.teams
(
    id serial PRIMARY KEY,
    name TEXT,
    organization_id INTEGER,
    created_at timestamp DEFAULT NOW(),
    updated_at timestamp DEFAULT NOW(),
    deleted_at timestamp with time zone,
    CONSTRAINT team_org_name_c UNIQUE (name,organization_id),
    CONSTRAINT team_org_id_fkey FOREIGN KEY (organization_id)
        REFERENCES spacon.organizations (id) MATCH SIMPLE
        ON UPDATE CASCADE ON DELETE CASCADE
)
WITH (
    OIDS=FALSE
);


CREATE TRIGGER update_updated_at_teams
    BEFORE UPDATE ON spacon.teams FOR EACH ROW EXECUTE
    PROCEDURE spacon.update_updated_at_column();

CREATE TABLE IF NOT EXISTS spacon.stores
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_type TEXT,
  version TEXT,
  uri TEXT,
  name TEXT,
  default_layers TEXT[],
  team_id INTEGER NOT NULL,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  deleted_at timestamp with time zone,
    CONSTRAINT stores_team_fkey FOREIGN KEY (team_id)
          REFERENCES spacon.teams (id) MATCH SIMPLE
          ON UPDATE CASCADE ON DELETE CASCADE
)
WITH (
  OIDS=FALSE
);

CREATE TRIGGER update_updated_at_stores
    BEFORE UPDATE ON spacon.stores FOR EACH ROW EXECUTE
    PROCEDURE spacon.update_updated_at_column();

CREATE TABLE IF NOT EXISTS spacon.forms
(
  id SERIAL PRIMARY KEY,
  form_key TEXT,
  form_label TEXT,
  version integer DEFAULT 1,
  team_id INTEGER NOT NULL,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  deleted_at timestamp with time zone,
  CONSTRAINT key_version_team_c UNIQUE (form_key,version,team_id),
  CONSTRAINT forms_team_fkey FOREIGN KEY (team_id)
        REFERENCES spacon.teams (id) MATCH SIMPLE
        ON UPDATE CASCADE ON DELETE CASCADE
)
WITH (
  OIDS=FALSE
);


CREATE TRIGGER update_updated_at_forms
  BEFORE UPDATE ON spacon.forms FOR EACH ROW EXECUTE
  PROCEDURE spacon.update_updated_at_column();

CREATE TABLE IF NOT EXISTS spacon.devices
(
  id SERIAL PRIMARY KEY,
  name TEXT,
  identifier text UNIQUE,
  device_info json,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  deleted_at timestamp with time zone
)
WITH (
  OIDS=FALSE
);
--ALTER TABLE devices OWNER TO spacon;

CREATE TRIGGER update_updated_at_devices
  BEFORE UPDATE ON spacon.devices FOR EACH ROW EXECUTE
  PROCEDURE spacon.update_updated_at_column();

CREATE TABLE IF NOT EXISTS spacon.device_locations
(
  id SERIAL PRIMARY KEY,
  geom geometry,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  deleted_at timestamp with time zone,
  device_id integer UNIQUE,
  CONSTRAINT device_locations_devices_fkey FOREIGN KEY (device_id)
    REFERENCES spacon.devices (id) MATCH SIMPLE
    ON UPDATE CASCADE ON DELETE SET NULL
)
WITH (
  OIDS=FALSE
);

CREATE TRIGGER update_updated_at_device_locations
  BEFORE UPDATE ON spacon.device_locations FOR EACH ROW EXECUTE
  PROCEDURE spacon.update_updated_at_column();

CREATE TABLE IF NOT EXISTS spacon.form_fields
(
  id SERIAL PRIMARY KEY,
  type TEXT,
  field_label TEXT,
  field_key TEXT,
  is_required boolean,
  "position" integer,
  "constraints" json,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  deleted_at timestamp with time zone,
  form_id integer,
  CONSTRAINT form_field_form_id_fkey FOREIGN KEY (form_id)
    REFERENCES spacon.forms (id) MATCH SIMPLE
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT field_key_form_id_pk UNIQUE(field_key,form_id)
)
WITH (
  OIDS=FALSE
);

CREATE TRIGGER update_updated_at_form_fields
  BEFORE UPDATE ON spacon.form_fields FOR EACH ROW EXECUTE
  PROCEDURE spacon.update_updated_at_column();

CREATE TABLE IF NOT EXISTS spacon.form_data
(
  id SERIAL PRIMARY KEY,
  val jsonb,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  deleted_at timestamp with time zone,
  device_id integer,
  form_id integer,
  CONSTRAINT form_data_device_id_fkey FOREIGN KEY (device_id)
    REFERENCES spacon.devices (id) MATCH SIMPLE
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT form_data_form_id_fkey FOREIGN KEY (form_id)
    REFERENCES spacon.forms (id) MATCH SIMPLE
    ON UPDATE CASCADE ON DELETE CASCADE
)
WITH (
  OIDS=FALSE
);

CREATE TRIGGER update_updated_at_form_data
    BEFORE UPDATE ON spacon.form_data FOR EACH ROW EXECUTE
    PROCEDURE spacon.update_updated_at_column();

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_type') THEN
        CREATE TYPE spacon.user_role_type AS ENUM ('user','team_admin','org_admin');
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_type') THEN
        CREATE TYPE spacon.user_role_type AS ENUM ('user','team_admin','org_admin');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS spacon.users (
  id            serial PRIMARY KEY,
  name          TEXT NOT NULL CHECK (name <> ''),
  email         TEXT NOT NULL UNIQUE,
  role          user_role_type,
  created_at    timestamp DEFAULT NOW(),
  updated_at    timestamp DEFAULT NOW(),
  deleted_at    timestamp with time zone,
  password      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS spacon.user_team (
  id serial PRIMARY KEY,
  user_id INTEGER,
  team_id INTEGER,
  CONSTRAINT user_team_user_fkey FOREIGN KEY (user_id)
      REFERENCES spacon.users (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT user_team_team_fkey FOREIGN KEY (team_id)
      REFERENCES spacon.teams (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TRIGGER update_updated_at_users
    BEFORE UPDATE ON spacon.users FOR EACH ROW EXECUTE
    PROCEDURE spacon.update_updated_at_column();

CREATE TABLE IF NOT EXISTS spacon.triggers
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  stores TEXT[],
  description TEXT,
  recipients json,
  rules json,
  repeated BOOL,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  deleted_at timestamp with time zone
)
WITH (
  OIDS=FALSE
);

CREATE TRIGGER update_updated_at_triggers
    BEFORE UPDATE ON spacon.triggers FOR EACH ROW EXECUTE
    PROCEDURE spacon.update_updated_at_column();
