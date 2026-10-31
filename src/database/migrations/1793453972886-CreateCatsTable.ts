import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCatsTable1793453972886 implements MigrationInterface {
    name = 'CreateCatsTable1793453972886'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."cats_gender_enum" AS ENUM('male', 'female')`);
        await queryRunner.query(`CREATE TYPE "public"."cats_compatibility_enum" AS ENUM('yes', 'no', 'unknown')`);
        await queryRunner.query(`CREATE TYPE "public"."cats_activity_level_enum" AS ENUM('low', 'medium', 'high')`);
        await queryRunner.query(`CREATE TYPE "public"."cats_status_enum" AS ENUM('available', 'in_foster', 'reserved', 'adopted')`);
        await queryRunner.query(`CREATE TABLE "cats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "gender" "public"."cats_gender_enum" NOT NULL, "story" text NOT NULL, "entry_date" date NOT NULL, "health_status" text NOT NULL, "special_needs" text, "birth_date" date NOT NULL, "birth_date_is_estimated" boolean NOT NULL, "vaccinated" boolean NOT NULL, "sterilized" boolean NOT NULL, "compatible_with_cats" "public"."cats_compatibility_enum" NOT NULL DEFAULT 'unknown', "compatible_with_dogs" "public"."cats_compatibility_enum" NOT NULL DEFAULT 'unknown', "compatible_with_children" "public"."cats_compatibility_enum" NOT NULL DEFAULT 'unknown', "activity_level" "public"."cats_activity_level_enum" NOT NULL, "adoption_fee" numeric(6,2), "status" "public"."cats_status_enum" NOT NULL DEFAULT 'available', "is_featured" boolean NOT NULL DEFAULT false, "is_urgent" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8c7cf5d7f99419dbbc880fbeadd" UNIQUE ("slug"), CONSTRAINT "PK_611e3c0a930b4ddc1541422864c" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "cats"`);
        await queryRunner.query(`DROP TYPE "public"."cats_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."cats_activity_level_enum"`);
        await queryRunner.query(`DROP TYPE "public"."cats_compatibility_enum"`);
        await queryRunner.query(`DROP TYPE "public"."cats_gender_enum"`);
    }

}
