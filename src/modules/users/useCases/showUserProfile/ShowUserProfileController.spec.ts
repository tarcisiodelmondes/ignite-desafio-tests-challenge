import createConnection from "../../../../database/index";

import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;

describe("Show Profile User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuid();

    const passwordHash = await hash("test1234", 8);

    await connection.query(`INSERT INTO USERS(id,name,email,password, created_at, updated_at)
    values(
      '${id}',
      'test_user',
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

  it("should be able to return authenticated user profile", async () => {
    const user = {
      name: "test_user",
      email: "test@email.com",
      password: "test1234",
    };

    const userAuthenticated = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    });

    const { token } = userAuthenticated.body;

    const res = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", user.name);
    expect(res.body).toHaveProperty("email", user.email);
    expect(res.body).toHaveProperty("id");
  });

  it("should not be able to return the profile of an unauthenticated user", async () => {
    const token = "fake_token_123324";
    const res = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("JWT invalid token!");
  });
});
