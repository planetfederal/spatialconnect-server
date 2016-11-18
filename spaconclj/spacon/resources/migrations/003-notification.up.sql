
CREATE TABLE IF NOT EXISTS public.notifications
(
  id SERIAL PRIMARY KEY,
  trigger_id UUID,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  deleted_at timestamp with time zone,
  device_id integer UNIQUE,
  CONSTRAINT notifications_triggers_fkey FOREIGN KEY (trigger_id)
    REFERENCES public.triggers (id) MATCH SIMPLE
    ON UPDATE CASCADE ON DELETE SET NULL
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.notifications
  OWNER TO spacon;

CREATE TRIGGER update_updated_at_notifications
    BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE
    PROCEDURE update_updated_at_column();