CREATE TABLE IF NOT EXISTS public.operations
(
  id                SERIAL PRIMARY KEY,
  geogig_repo_name  TEXT,
  geogig_commit_id  TEXT,
  geogig_tree       TEXT,
  geogig_feature_id TEXT,
  audit_op          INTEGER,
  audit_timestamp   TIMESTAMP DEFAULT NOW(),
  properties        JSON,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW(),
  deleted_at        TIMESTAMP with time zone,
  CONSTRAINT feature_timestamp_pk UNIQUE (geogig_feature_id, audit_timestamp)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.operations OWNER TO spacon;
