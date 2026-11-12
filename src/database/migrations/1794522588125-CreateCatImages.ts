import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCatImages1794522588125 implements MigrationInterface {
    name = 'CreateCatImages1794522588125'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cat_images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cat_id" uuid NOT NULL, "image_url" text NOT NULL, "alt_text" text NOT NULL, "display_order" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7ac9da7df2db8a3fdef736a2fdd" UNIQUE ("cat_id", "display_order"), CONSTRAINT "CHK_062d9e7f9353d5e375760a78ee" CHECK ("display_order" >= 1), CONSTRAINT "PK_0f3449839fa2992a8cb29414616" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cat_images" ADD CONSTRAINT "FK_76df3cf5c862b0210af80f1a8e8" FOREIGN KEY ("cat_id") REFERENCES "cats"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cat_images" DROP CONSTRAINT "FK_76df3cf5c862b0210af80f1a8e8"`);
        await queryRunner.query(`DROP TABLE "cat_images"`);
    }

}
