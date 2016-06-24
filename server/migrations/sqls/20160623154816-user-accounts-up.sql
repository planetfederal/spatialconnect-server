CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS '
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
' LANGUAGE 'plpgsql';

CREATE TABLE users (
    id          serial PRIMARY KEY,
    name        TEXT NOT NULL CHECK (name <> ''),
    email       TEXT NOT NULL UNIQUE,
    created_at  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone,
    password VARCHAR(72) NOT NULL DEFAULT 'invalid',
    level VARCHAR(12) NOT NULL default 'user'
);

CREATE TRIGGER update_updated_at_users
    BEFORE UPDATE ON users FOR EACH ROW EXECUTE
    PROCEDURE update_updated_at_column();
