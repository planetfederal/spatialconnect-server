CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS '
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
' LANGUAGE 'plpgsql';

CREATE TABLE users (
    id          serial PRIMARY KEY,
    name        varchar(40) NOT NULL CHECK (name <> ''),
    email       varchar(60) NOT NULL UNIQUE,
    created_at  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    password VARCHAR(162) NOT NULL DEFAULT 'invalid',
    level VARCHAR(12) NOT NULL default 'user'
);

CREATE TRIGGER update_updated_at_users
    BEFORE UPDATE ON users FOR EACH ROW EXECUTE
    PROCEDURE update_updated_at_column();

CREATE TABLE auth_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ON auth_tokens (id, created_at DESC);