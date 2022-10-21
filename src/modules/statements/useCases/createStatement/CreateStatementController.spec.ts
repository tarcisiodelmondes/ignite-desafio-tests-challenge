import createConnection from "../../../../database/index";

import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;

describe("Create Statement Controller", () => {
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

  it("should be able to a create new statement of deposit", async () => {
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

    const res = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 700,
        description: "test desc",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(res.status).toBe(201);
  });

  it("should be able to a create new statement of withdraw", async () => {
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

    const res = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 50,
        description: "test desc1",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(res.status).toBe(201);
  });

  it("should not be able to create a new withdraw statement with insufficient balance", async () => {
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

    const res = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 900,
        description: "test desc",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Insufficient funds");
  });

  it("should not be able to create a new statement for a user who does not exist", async () => {
    const token = "fake_token2323545345";

    const res = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 700,
        description: "test desc",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("JWT invalid token!");
  });
});
