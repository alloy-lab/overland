import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_pages_template" AS ENUM('default', 'full-width', 'sidebar', 'landing');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_template" AS ENUM('default', 'full-width', 'sidebar', 'landing');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_examples_type" AS ENUM('color', 'date-range', 'contact', 'gallery', 'conditional', 'theme', 'seo');
  CREATE TYPE "public"."enum_examples_status" AS ENUM('draft', 'published', 'archived');
  CREATE TYPE "public"."enum_examples_color" AS ENUM('#3B82F6', '#6B7280', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#F97316', 'custom');
  CREATE TYPE "public"."enum_examples_conditional_content_content_type" AS ENUM('text', 'image', 'video', 'embed');
  CREATE TYPE "public"."enum_examples_theme_primary_color" AS ENUM('#3B82F6', '#10B981', '#8B5CF6', '#EF4444', 'custom');
  CREATE TYPE "public"."enum_examples_theme_font_family" AS ENUM('system', 'inter', 'roboto', 'open-sans', 'lato');
  CREATE TYPE "public"."enum_examples_theme_layout" AS ENUM('centered', 'full-width', 'sidebar');
  CREATE TYPE "public"."enum_examples_difficulty" AS ENUM('beginner', 'intermediate', 'advanced');
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"excerpt" varchar,
  	"content" jsonb,
  	"featured_image_id" integer,
  	"status" "enum_pages_status" DEFAULT 'draft',
  	"published_date" timestamp(3) with time zone,
  	"scheduled_date" timestamp(3) with time zone,
  	"expiration_date" timestamp(3) with time zone,
  	"template" "enum_pages_template" DEFAULT 'default',
  	"show_in_navigation" boolean DEFAULT false,
  	"navigation_order" numeric,
  	"parent_page_id" integer,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_keywords" varchar,
  	"seo_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_excerpt" varchar,
  	"version_content" jsonb,
  	"version_featured_image_id" integer,
  	"version_status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"version_published_date" timestamp(3) with time zone,
  	"version_scheduled_date" timestamp(3) with time zone,
  	"version_expiration_date" timestamp(3) with time zone,
  	"version_template" "enum__pages_v_version_template" DEFAULT 'default',
  	"version_show_in_navigation" boolean DEFAULT false,
  	"version_navigation_order" numeric,
  	"version_parent_page_id" integer,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_keywords" varchar,
  	"version_seo_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "media_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer
  );
  
  CREATE TABLE "examples_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar,
  	"alt" varchar NOT NULL,
  	"link" varchar,
  	"display_order" numeric DEFAULT 0
  );
  
  CREATE TABLE "examples" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"type" "enum_examples_type" NOT NULL,
  	"description" varchar,
  	"status" "enum_examples_status" DEFAULT 'draft',
  	"color" "enum_examples_color",
  	"custom_color" varchar,
  	"date_range_start_date" timestamp(3) with time zone NOT NULL,
  	"date_range_end_date" timestamp(3) with time zone,
  	"date_range_all_day" boolean DEFAULT false,
  	"contact_info_name" varchar,
  	"contact_info_email" varchar,
  	"contact_info_phone" varchar,
  	"contact_info_website" varchar,
  	"contact_info_address_street" varchar,
  	"contact_info_address_city" varchar,
  	"contact_info_address_state" varchar,
  	"contact_info_address_zip_code" varchar,
  	"contact_info_address_country" varchar,
  	"contact_info_social_media_twitter" varchar,
  	"contact_info_social_media_linkedin" varchar,
  	"contact_info_social_media_facebook" varchar,
  	"contact_info_social_media_instagram" varchar,
  	"conditional_content_content_type" "enum_examples_conditional_content_content_type" NOT NULL,
  	"conditional_content_text_content" jsonb,
  	"conditional_content_image_content_id" integer,
  	"conditional_content_video_content_video_file_id" integer,
  	"conditional_content_video_content_video_url" varchar,
  	"conditional_content_video_content_autoplay" boolean DEFAULT false,
  	"conditional_content_embed_content" varchar,
  	"theme_primary_color" "enum_examples_theme_primary_color",
  	"theme_custom_primary_color" varchar,
  	"theme_font_family" "enum_examples_theme_font_family" DEFAULT 'system',
  	"theme_layout" "enum_examples_theme_layout" DEFAULT 'centered',
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_keywords" varchar,
  	"seo_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"seo_canonical_url" varchar,
  	"tags" varchar,
  	"featured" boolean DEFAULT false,
  	"difficulty" "enum_examples_difficulty" DEFAULT 'beginner',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Overland Stack' NOT NULL,
  	"description" varchar DEFAULT 'A modern, full-stack web application built with React Router SSR and Payload CMS' NOT NULL,
  	"logo_id" integer,
  	"favicon_id" integer,
  	"social_twitter" varchar,
  	"social_github" varchar,
  	"social_linkedin" varchar,
  	"contact_email" varchar,
  	"contact_phone" varchar,
  	"contact_address" varchar,
  	"analytics_google_analytics_id" varchar,
  	"analytics_google_tag_manager_id" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "media" ADD COLUMN "caption" varchar;
  ALTER TABLE "media" ADD COLUMN "folder" varchar;
  ALTER TABLE "media" ADD COLUMN "tags" varchar;
  ALTER TABLE "media" ADD COLUMN "metadata_width" numeric;
  ALTER TABLE "media" ADD COLUMN "metadata_height" numeric;
  ALTER TABLE "media" ADD COLUMN "metadata_format" varchar;
  ALTER TABLE "media" ADD COLUMN "metadata_size" numeric;
  ALTER TABLE "media" ADD COLUMN "metadata_optimized" boolean DEFAULT false;
  ALTER TABLE "media" ADD COLUMN "usage_last_used" timestamp(3) with time zone;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_medium_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_medium_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_medium_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_medium_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_medium_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_medium_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_large_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_large_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_large_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_large_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_large_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_large_filename" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "examples_id" integer;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_parent_page_id_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_parent_page_id_pages_id_fk" FOREIGN KEY ("version_parent_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "examples_gallery" ADD CONSTRAINT "examples_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "examples_gallery" ADD CONSTRAINT "examples_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."examples"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "examples" ADD CONSTRAINT "examples_conditional_content_image_content_id_media_id_fk" FOREIGN KEY ("conditional_content_image_content_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "examples" ADD CONSTRAINT "examples_conditional_content_video_content_video_file_id_media_id_fk" FOREIGN KEY ("conditional_content_video_content_video_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "examples" ADD CONSTRAINT "examples_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site" ADD CONSTRAINT "site_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site" ADD CONSTRAINT "site_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_featured_image_idx" ON "pages" USING btree ("featured_image_id");
  CREATE INDEX "pages_parent_page_idx" ON "pages" USING btree ("parent_page_id");
  CREATE INDEX "pages_seo_seo_image_idx" ON "pages" USING btree ("seo_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_featured_image_idx" ON "_pages_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_pages_v_version_version_parent_page_idx" ON "_pages_v" USING btree ("version_parent_page_id");
  CREATE INDEX "_pages_v_version_seo_version_seo_image_idx" ON "_pages_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "media_rels_order_idx" ON "media_rels" USING btree ("order");
  CREATE INDEX "media_rels_parent_idx" ON "media_rels" USING btree ("parent_id");
  CREATE INDEX "media_rels_path_idx" ON "media_rels" USING btree ("path");
  CREATE INDEX "media_rels_pages_id_idx" ON "media_rels" USING btree ("pages_id");
  CREATE INDEX "examples_gallery_order_idx" ON "examples_gallery" USING btree ("_order");
  CREATE INDEX "examples_gallery_parent_id_idx" ON "examples_gallery" USING btree ("_parent_id");
  CREATE INDEX "examples_gallery_image_idx" ON "examples_gallery" USING btree ("image_id");
  CREATE INDEX "examples_conditional_content_conditional_content_image_c_idx" ON "examples" USING btree ("conditional_content_image_content_id");
  CREATE INDEX "examples_conditional_content_video_content_conditional_c_idx" ON "examples" USING btree ("conditional_content_video_content_video_file_id");
  CREATE INDEX "examples_seo_seo_image_idx" ON "examples" USING btree ("seo_image_id");
  CREATE INDEX "examples_updated_at_idx" ON "examples" USING btree ("updated_at");
  CREATE INDEX "examples_created_at_idx" ON "examples" USING btree ("created_at");
  CREATE INDEX "site_logo_idx" ON "site" USING btree ("logo_id");
  CREATE INDEX "site_favicon_idx" ON "site" USING btree ("favicon_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_examples_fk" FOREIGN KEY ("examples_id") REFERENCES "public"."examples"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_medium_sizes_medium_filename_idx" ON "media" USING btree ("sizes_medium_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_examples_id_idx" ON "payload_locked_documents_rels" USING btree ("examples_id");`);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "media_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "examples_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "examples" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "media_rels" CASCADE;
  DROP TABLE "examples_gallery" CASCADE;
  DROP TABLE "examples" CASCADE;
  DROP TABLE "site" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_examples_fk";
  
  DROP INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx";
  DROP INDEX "media_sizes_medium_sizes_medium_filename_idx";
  DROP INDEX "media_sizes_large_sizes_large_filename_idx";
  DROP INDEX "payload_locked_documents_rels_pages_id_idx";
  DROP INDEX "payload_locked_documents_rels_examples_id_idx";
  ALTER TABLE "media" DROP COLUMN "caption";
  ALTER TABLE "media" DROP COLUMN "folder";
  ALTER TABLE "media" DROP COLUMN "tags";
  ALTER TABLE "media" DROP COLUMN "metadata_width";
  ALTER TABLE "media" DROP COLUMN "metadata_height";
  ALTER TABLE "media" DROP COLUMN "metadata_format";
  ALTER TABLE "media" DROP COLUMN "metadata_size";
  ALTER TABLE "media" DROP COLUMN "metadata_optimized";
  ALTER TABLE "media" DROP COLUMN "usage_last_used";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_url";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_width";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_height";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_medium_url";
  ALTER TABLE "media" DROP COLUMN "sizes_medium_width";
  ALTER TABLE "media" DROP COLUMN "sizes_medium_height";
  ALTER TABLE "media" DROP COLUMN "sizes_medium_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_medium_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_medium_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_large_url";
  ALTER TABLE "media" DROP COLUMN "sizes_large_width";
  ALTER TABLE "media" DROP COLUMN "sizes_large_height";
  ALTER TABLE "media" DROP COLUMN "sizes_large_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_large_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_large_filename";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "examples_id";
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum_pages_template";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_version_template";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum_examples_type";
  DROP TYPE "public"."enum_examples_status";
  DROP TYPE "public"."enum_examples_color";
  DROP TYPE "public"."enum_examples_conditional_content_content_type";
  DROP TYPE "public"."enum_examples_theme_primary_color";
  DROP TYPE "public"."enum_examples_theme_font_family";
  DROP TYPE "public"."enum_examples_theme_layout";
  DROP TYPE "public"."enum_examples_difficulty";`);
}
