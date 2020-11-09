
-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  created_at timestamp NULL DEFAULT NULL,
  updated_at timestamp NULL DEFAULT NULL,
  deleted_at timestamp NULL DEFAULT NULL,
  unique_id  UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  salt VARCHAR DEFAULT NULL,
  password VARCHAR DEFAULT NULL,
  email VARCHAR NOT NULL,
  name VARCHAR NOT NULL
);

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
DROP TABLE users;
