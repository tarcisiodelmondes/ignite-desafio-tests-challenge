import createConnection from "../../../../database/index";

import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;

describe("Get Statement Controller", () => {
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

  it("should be able to get user statement operation", async () => {
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

    const statement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 700,
        description: "test desc",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const res = await request(app)
      .get(`/api/v1/statements/${statement.body.id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", statement.body.id);
    expect(res.body).toHaveProperty("type", statement.body.type);
    expect(res.body).toHaveProperty("created_at", statement.body.created_at);
  });

  it("shouldn't be able to get statement operation from a user that doesn't exist", async () => {
    const token = "fake_token_34234234324";

    const res = await request(app)
      .get(`/api/v1/statements/435353454`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("JWT invalid token!");
  });

  it("should not be able to get statement operation that doesn't exist", async () => {
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
      .get(`/api/v1/statements/efcc1340-fbf7-456a-95b6-ecb22c69a2c6`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Statement not found");
  });
});
