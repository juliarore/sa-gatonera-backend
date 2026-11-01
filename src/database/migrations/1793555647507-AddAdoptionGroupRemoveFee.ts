import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdoptionGroupRemoveFee1793555647507 implements MigrationInterface {
    name = 'AddAdoptionGroupRemoveFee1793555647507'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cats" DROP COLUMN "adoption_fee"`);
        await queryRunner.query(`ALTER TABLE "cats" ADD "adoption_group_id" uuid`);
        await queryRunner.query(`CREATE INDEX "IDX_7f43261ad24bbc925ddc47ae78" ON "cats"  ("adoption_group_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_7f43261ad24bbc925ddc47ae78"`);
        await queryRunner.query(`ALTER TABLE "cats" DROP COLUMN "adoption_group_id"`);
        await queryRunner.query(`ALTER TABLE "cats" ADD "adoption_fee" numeric(6,2)`);
    }

}
