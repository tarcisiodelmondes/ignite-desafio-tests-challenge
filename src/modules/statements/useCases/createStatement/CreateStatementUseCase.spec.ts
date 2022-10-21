import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createUseUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

describe("Create Statement UseCase", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUseUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to a create new statement", async () => {
    const user = {
      name: "test",
      email: "test@email.com",
      password: "test1234",
    };

    const userCreated = await createUseUseCase.execute(user);

    const statmentCreated = await createStatementUseCase.execute({
      user_id: userCreated.id as string,
      amount: 1000,
      description: "test desc",
      type: "deposit" as OperationType,
    });

    expect(statmentCreated).toHaveProperty("id");
  });

  it("should not be able to create a new withdraw statement with insufficient balance", async () => {
    const user = {
      name: "test",
      email: "test@email.com",
      password: "test1234",
    };

    const userCreated = await createUseUseCase.execute(user);

    expect(async () => {
      await createStatementUseCase.execute({
        user_id: userCreated.id as string,
        amount: 1000,
        description: "test desc",
        type: "withdraw" as OperationType,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it("should not be able to create a new statement for a user who does not exist", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "23424234234",
        amount: 1000,
        description: "test desc",
        type: "withdraw" as OperationType,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});
