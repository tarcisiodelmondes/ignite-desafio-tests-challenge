import createConnection from "../../../../database/index";

import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;

describe("Authenticate User Controller", () => {
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

  it("should be able to authenticate an user", async () => {
    const res = await request(app).post("/api/v1/sessions").send({
      email: "test@email.com",
      password: "test1234",
    });

    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty("id");
    expect(res.body).toHaveProperty("token");
  });

  it("should not be able to authenticate an nonexistent user", async () => {
    const res = await request(app).post("/api/v1/sessions").send({
      email: "noexists@email.com",
      password: "test1234",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Incorrect email or password");
  });

  it("should not be able to authenticate with incorrect password", async () => {
    const res = await request(app).post("/api/v1/sessions").send({
      email: "test@email.com",
      password: "password_incorrect",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Incorrect email or password");
  });

  it("should not be able to authenticate with incorrect email", async () => {
    const res = await request(app).post("/api/v1/sessions").send({
      email: "incorrect@email.com",
      password: "test1234",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Incorrect email or password");
  });
});
