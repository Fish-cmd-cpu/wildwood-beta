CREATE TABLE "wildwood_chunk_edits" (
	"id" text PRIMARY KEY,
	"world_id" text NOT NULL,
	"chunk_key" text NOT NULL,
	"blocks" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wildwood_worlds" (
	"id" text PRIMARY KEY,
	"seed" text NOT NULL,
	"player" jsonb NOT NULL,
	"inventory" jsonb NOT NULL,
	"progress" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wildwood_chunk_edits" ADD CONSTRAINT "wildwood_chunk_edits_world_id_wildwood_worlds_id_fkey" FOREIGN KEY ("world_id") REFERENCES "wildwood_worlds"("id") ON DELETE CASCADE;