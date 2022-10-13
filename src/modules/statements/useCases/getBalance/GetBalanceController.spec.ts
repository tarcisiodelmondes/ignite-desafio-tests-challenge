import createConnection from "../../../../database/index";

import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;

describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuid();

    const passwordHash = await hash("test1234", 8);

    await connection.query(`INSERT INTO USERS(id,name,email,password, created_at, updated_at)
    values(
      '${id}',
      'test',
      'test@email.com',
      '${passwordHash}',
      'now()',
      'now()'
    )
  `);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get user balance", async () => {
    const user = {
      name: "test",
      email: "test@email.com",
      password: "test1234",
    };

    const userAuthenticated = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    });

    const { token } = userAuthenticated.body;

    const res1 = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(res1.status).toBe(200);
    expect(res1.body).toHaveProperty("balance", 0);

    // deposit 700 in account
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 700,
        description: "test desc",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });
    const res2 = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(res2.status).toBe(200);
    expect(res2.body).toHaveProperty("balance", 700);
  });

  it("shouldn't be able to get balance from a user that doesn't exist", async () => {
    const token = "fake_token_34234234324";

    const res = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("JWT invalid token!");
  });
});
