import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class AddSenderIdColumnAndNewTypeOfOperation1666376799272
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "statements",
      new TableColumn({
        name: "sender_id",
        type: "uuid",
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      "statements",
      new TableForeignKey({
        columnNames: ["sender_id"],
        name: "FKUserSendId",
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      })
    );

    await queryRunner.changeColumn(
      "statements",
      "type",
      new TableColumn({
        name: "type",
        type: "enum",
        enum: ["deposit", "withdraw", "transfer"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("statements", "sender_id");
    await queryRunner.dropForeignKey("statements", "FKUserSendId");

    await queryRunner.changeColumn(
      "statements",
      "type",
      new TableColumn({
        name: "type",
        type: "enum",
        enum: ["deposit", "withdraw"],
      })
    );
  }
}
