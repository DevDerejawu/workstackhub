CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"avatar_url" text,
	"is_verified" boolean DEFAULT false,
	"verification_token" text,
	"verification_token_expires_at" timestamp with time zone,
	"reset_token" text,
	"reset_token_expires_at" timestamp with time zone,
	"is_active" boolean DEFAULT true,
	"is_locked" boolean DEFAULT false,
	"failed_login_attempts" integer DEFAULT 0,
	"locked_until" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"last_login_ip" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_verification_token_unique" UNIQUE("verification_token"),
	CONSTRAINT "users_reset_token_unique" UNIQUE("reset_token")
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"type" text DEFAULT 'personal' NOT NULL,
	"avatar_url" text,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "slug_workspaces_unique" UNIQUE("slug"),
	CONSTRAINT "name_workspaces_check" CHECK (length(trim("workspaces"."name")) >= 1),
	CONSTRAINT "type_workspaces_check" CHECK ("workspaces"."type" IN ('personal', 'team')),
	CONSTRAINT "slug_workspaces_check" CHECK ("workspaces"."slug" ~ '^[a-z0-9-]+$')
);
--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_verification_token" ON "users" USING btree ("verification_token");--> statement-breakpoint
CREATE INDEX "idx_users_reset_token" ON "users" USING btree ("reset_token");--> statement-breakpoint
CREATE INDEX "idx_users_created_at" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_workspaces_slug" ON "workspaces" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_workspaces_created_by" ON "workspaces" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_workspaces_type" ON "workspaces" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_workspaces_created_at" ON "workspaces" USING btree ("created_at");