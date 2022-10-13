import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUseUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create User UseCase", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUseUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to a new user", async () => {
    const user = {
      name: "test",
      email: "test@email.com",
      password: "test1234",
    };

    await createUseUseCase.execute(user);
  });

  it("should not be able to a new user if the user already exists", async () => {
    const user = {
      name: "test",
      email: "test@email.com",
      password: "test1234",
    };

    expect(async () => {
      await createUseUseCase.execute(user);
      await createUseUseCase.execute(user);
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
