CREATE TYPE message_type AS ENUM ('trigger');

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    info json,
    type message_type,
    created_at timestamp DEFAULT NOW()
) WITH (
    OIDS=FALSE
);

ALTER TABLE notifications ADD COLUMN recipient text;
ALTER TABLE notifications ADD COLUMN message_id integer;
ALTER TABLE notifications ADD CONSTRAINT notifications_messages_fkey
    FOREIGN KEY (message_id) REFERENCES public.messages (id) MATCH SIMPLE
    ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE notifications DROP COLUMN IF EXISTS device_id;
ALTER TABLE notifications DROP COLUMN IF EXISTS trigger_id;
ALTER TABLE notifications ADD COLUMN sent timestamp DEFAULT NULL;
ALTER TABLE notifications ADD COLUMN delivered timestamp DEFAULT NULL;
