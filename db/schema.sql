PRAGMA journal_mode = WAL;
-- Create the tables
CREATE TABLE "auth_user" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE
);
CREATE TABLE "auth_session" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "active_expires" INTEGER NOT NULL,
  "idle_expires" INTEGER NOT NULL,
  "user_id" TEXT NOT NULL,
  FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") ON DELETE CASCADE,
  CONSTRAINT "auth_session_user_id" UNIQUE ("user_id")
);
CREATE TABLE "auth_key" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "hashed_password" TEXT,
  "primary_key" INTEGER NOT NULL,
  "expires" INTEGER,
  "user_id" TEXT NOT NULL,
  FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") ON DELETE CASCADE,
  CONSTRAINT "auth_key_user_id" UNIQUE ("user_id")
);
-- partys are used to party anon users together
CREATE TABLE "party" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "hashed_id" TEXT NOT NULL UNIQUE,
  "hashed_password" TEXT,
  "party_name" TEXT NOT NULL,
  "created_at" DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime')),
  "owner_user_id" TEXT NOT NULL,
  FOREIGN KEY ("owner_user_id") REFERENCES "auth_user" ("id") ON DELETE CASCADE,
  CONSTRAINT "party_owner_user_id_party_name" UNIQUE ("owner_user_id", "party_name")
);
-- Anon users are part of a party but do not have an account
CREATE TABLE "anon_user" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT NOT NULL,
  "created_at" DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime')),
  -- "active" is True when the user is logged in and connected to this anon account, or an anon user is in a session
  "active" BOOLEAN NOT NULL DEFAULT 0,
  -- can be null if the user has not connected to this anon account yet
  "user_id" TEXT,
  FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") ON DELETE CASCADE,
  CONSTRAINT "anon_user_user_id" UNIQUE ("user_id")
);
-- JOIN table for anon users and partys
CREATE TABLE "anon_user_party" (
  "anon_user_id" INTEGER NOT NULL,
  "party_id" INTEGER NOT NULL,
  FOREIGN KEY ("anon_user_id") REFERENCES "anon_user" ("id") ON DELETE CASCADE,
  FOREIGN KEY ("party_id") REFERENCES "party" ("id") ON DELETE CASCADE,
  PRIMARY KEY ("anon_user_id", "party_id"),
  CONSTRAINT "anon_user_party_anon_user_id_party_id" UNIQUE ("anon_user_id", "party_id")
);
-- Anon Tokens are used to authenticate users without an account
CREATE TABLE "anon_token" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expires" INTEGER,
  "created_at" DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime')),
  "anon_user_id" INTEGER NOT NULL,
  FOREIGN KEY ("anon_user_id") REFERENCES "anon_user" ("id") ON DELETE CASCADE,
  CONSTRAINT "anon_token_anon_user_id" UNIQUE ("anon_user_id")
);
-- Create indexes
CREATE UNIQUE INDEX "auth_user_email" ON "auth_user" ("email");
CREATE UNIQUE INDEX "auth_session_user_id" ON "auth_session" ("user_id");
CREATE UNIQUE INDEX "auth_key_user_id" ON "auth_key" ("user_id");
-- CREATE UNIQUE INDEX "auth_key_primary_key" ON "auth_key" ("primary_key");
CREATE UNIQUE INDEX "anon_user_user_id" ON "anon_user" ("user_id");
CREATE UNIQUE INDEX "party_owner_user_id_party_name" ON "party" ("owner_user_id", "party_name");
CREATE UNIQUE INDEX "anon_user_party_anon_user_id_party_id" ON "anon_user_party" ("anon_user_id", "party_id");
CREATE UNIQUE INDEX "anon_token_anon_user_id" ON "anon_token" ("anon_user_id");
-- Set the table mapping
-- PRAGMA rename_table("auth_user", "AuthUser");
-- PRAGMA rename_table("auth_session", "AuthSession");
-- PRAGMA rename_table("auth_key", "AuthKey");
-- PRAGMA journal_mode = WAL;