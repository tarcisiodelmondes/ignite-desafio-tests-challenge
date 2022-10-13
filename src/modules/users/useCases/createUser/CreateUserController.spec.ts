import createConnection from "../../../../database/index";

import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to a new user", async () => {
    const res = await request(app).post("/api/v1/users").send({
      name: "name test",
      email: "test@email.com",
      password: "test1234",
    });

    expect(res.status).toBe(201);
  });

  it("should not be able to a new user if the user already exists", async () => {
    const user = {
      name: "test",
      email: "email@test.com",
      password: "test1234",
    };

    await request(app).post("/api/v1/users").send(user);

    const res = await request(app).post("/api/v1/users").send(user);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("User already exists");
  });
});
