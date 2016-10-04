CREATE TABLE IF NOT EXISTS public.triggers
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  description TEXT,
  recipients TEXT[],
  definition json,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  deleted_at timestamp with time zone
)
WITH (
  OIDS=FALSE
);

ALTER TABLE public.triggers OWNER TO spacon;
