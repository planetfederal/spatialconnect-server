CREATE TYPE source_type AS ENUM ('trigger','web');
ALTER TABLE messages ALTER COLUMN type SET DATA TYPE source_type USING type::text::source_type;
DROP TYPE IF EXISTS message_type;


