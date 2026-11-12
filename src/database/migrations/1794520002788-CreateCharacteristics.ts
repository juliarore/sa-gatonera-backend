import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCharacteristics1794520002788 implements MigrationInterface {
    name = 'CreateCharacteristics1794520002788'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "characteristics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" text NOT NULL, "label_masculine" text NOT NULL, "label_feminine" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_bc9fe2d688641e603956c1b86e5" UNIQUE ("code"), CONSTRAINT "PK_a64133a287a0f2d735da40fcd89" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cat_characteristics" ("cat_id" uuid NOT NULL, "characteristic_id" uuid NOT NULL, CONSTRAINT "PK_6bff86c191dcefebcdfee2ff0e9" PRIMARY KEY ("cat_id", "characteristic_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b555695d1b7782703bb1d6fd5b" ON "cat_characteristics"  ("cat_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_a5d70f446d2306d0a8ae8e0da4" ON "cat_characteristics"  ("characteristic_id") `);
        await queryRunner.query(`ALTER TABLE "cat_characteristics" ADD CONSTRAINT "FK_b555695d1b7782703bb1d6fd5b4" FOREIGN KEY ("cat_id") REFERENCES "cats"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "cat_characteristics" ADD CONSTRAINT "FK_a5d70f446d2306d0a8ae8e0da4d" FOREIGN KEY ("characteristic_id") REFERENCES "characteristics"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cat_characteristics" DROP CONSTRAINT "FK_a5d70f446d2306d0a8ae8e0da4d"`);
        await queryRunner.query(`ALTER TABLE "cat_characteristics" DROP CONSTRAINT "FK_b555695d1b7782703bb1d6fd5b4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a5d70f446d2306d0a8ae8e0da4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b555695d1b7782703bb1d6fd5b"`);
        await queryRunner.query(`DROP TABLE "cat_characteristics"`);
        await queryRunner.query(`DROP TABLE "characteristics"`);
    }

}
