import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let createUseUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Create Statement UseCase", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUseUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able to get user balance", async () => {
    const user = {
      name: "test",
      email: "test@email.com",
      password: "test1234",
    };

    const userCreated = await createUseUseCase.execute(user);
    await createStatementUseCase.execute({
      user_id: userCreated.id as string,
      amount: 1000,
      description: "test desc",
      type: "deposit" as OperationType,
    });

    const getBalance = await getBalanceUseCase.execute({
      user_id: userCreated.id as string,
    });

    expect(getBalance).toHaveProperty("balance", 1000);
  });

  it("shouldn't be able to get balance from a user that doesn't exist", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "3242425",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
