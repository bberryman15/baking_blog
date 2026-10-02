CREATE TABLE IF NOT EXISTS baking_posts (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(140) NOT NULL,
  date_made DATE NOT NULL,
  image_url TEXT NOT NULL,
  recipe_source VARCHAR(500) NOT NULL DEFAULT '',
  recipe_type VARCHAR(50) NOT NULL,
  tips JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(tips) = 'array'),
  thoughts JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(thoughts) = 'array'),
  flavors JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(flavors) = 'array'),
  enjoyment_rating SMALLINT NOT NULL CHECK (enjoyment_rating BETWEEN 1 AND 5),
  description VARCHAR(500) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS baking_posts_date_made_idx
  ON baking_posts (date_made DESC);

CREATE INDEX IF NOT EXISTS baking_posts_recipe_type_idx
  ON baking_posts (recipe_type);
