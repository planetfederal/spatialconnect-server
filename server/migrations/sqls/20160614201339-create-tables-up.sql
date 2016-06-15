CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.stores
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_type character varying(255),
  version double precision,
  uri character varying(255),
  name character varying(255),
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  deleted_at timestamp with time zone
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.stores
  OWNER TO spacon;

CREATE TABLE IF NOT EXISTS public.forms
(
  id SERIAL PRIMARY KEY,
  name character varying(255),
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  deleted_at timestamp with time zone
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.forms
  OWNER TO spacon;

CREATE TABLE IF NOT EXISTS public.devices
(
  id SERIAL PRIMARY KEY,
  name character varying(255),
  identifier character varying(255),
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  deleted_at timestamp with time zone
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.devices
  OWNER TO spacon;

CREATE TABLE IF NOT EXISTS public.device_locations
(
  id SERIAL PRIMARY KEY,
  x double precision,
  y double precision,
  z double precision,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  deleted_at timestamp with time zone
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.device_locations
  OWNER TO spacon;

CREATE TABLE IF NOT EXISTS public.form_field
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type character varying(255),
  label character varying(255),
  key character varying(255),
  is_required boolean,
  "position" integer,
  initial_value character varying(255),
  minimum character varying(255),
  maximum character varying(255),
  exclusive_minimum character varying(255),
  exclusive_maximum character varying(255),
  is_integer boolean,
  minimum_length integer,
  maximum_length integer,
  pattern character varying(255),
  options character varying(255)[],
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  deleted_at timestamp with time zone,
  form_id integer,
  CONSTRAINT form_field_form_id_fkey FOREIGN KEY (form_id)
      REFERENCES public.forms (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE SET NULL
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.form_field
  OWNER TO spacon;

CREATE TABLE IF NOT EXISTS public.form_data
(
  id SERIAL PRIMARY KEY,
  val json,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  deleted_at timestamp with time zone,
  device_id integer,
  form_id integer,
  CONSTRAINT form_data_device_id_fkey FOREIGN KEY (device_id)
      REFERENCES public.devices (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT form_data_form_id_fkey FOREIGN KEY (form_id)
      REFERENCES public.forms (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.form_data
  OWNER TO spacon;
