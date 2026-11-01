CREATE TABLE IF NOT EXISTS "migrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"executed_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "migrations_name_unique" UNIQUE("name")
);
