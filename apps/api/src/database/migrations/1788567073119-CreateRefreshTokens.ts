import { MigrationInterface, QueryRunner } from 'typeorm';

// Escrita manualmente: `migration:generate` compara TODO o schema (incluindo
// as tabelas do Rails, como `users`/`companies`), e como as entidades TypeORM
// não mapeiam 100% dessas tabelas (colunas do Devise, índices parciais, nomes
// de FK do Rails), ele propõe ALTER/DROP destrutivos nelas. Aqui só entra o
// que é de fato novo: a tabela `refresh_tokens`, que não existe no Rails.
export class CreateRefreshTokens1788567073119 implements MigrationInterface {
  name = 'CreateRefreshTokens1788567073119';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" BIGSERIAL NOT NULL,
        "created_at" TIMESTAMP(6) NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP(6) NOT NULL DEFAULT now(),
        "user_id" bigint NOT NULL,
        "token_hash" character varying NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "revoked_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "index_refresh_tokens_on_token_hash" ON "refresh_tokens" ("token_hash")
    `);

    await queryRunner.query(`
      ALTER TABLE "refresh_tokens"
      ADD CONSTRAINT "FK_refresh_tokens_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
  }
}
