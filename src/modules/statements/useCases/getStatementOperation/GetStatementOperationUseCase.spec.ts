import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let createUseUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Create Statement UseCase", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUseUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to get user statement operation", async () => {
    const user = {
      name: "test",
      email: "test@email.com",
      password: "test1234",
    };

    const userCreated = await createUseUseCase.execute(user);
    const statementCreated = await createStatementUseCase.execute({
      user_id: userCreated.id as string,
      amount: 1000,
      description: "test desc",
      type: "deposit" as OperationType,
    });

    const getStatement = await getStatementOperationUseCase.execute({
      user_id: userCreated.id as string,
      statement_id: statementCreated.id as string,
    });

    expect(getStatement).toEqual(statementCreated);
  });

  it("shouldn't be able to get statement operation from a user that doesn't exist", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "3242425",
        statement_id: "32424234243",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get statement operation that doesn't exist", async () => {
    const user = {
      name: "test",
      email: "test@email.com",
      password: "test1234",
    };

    expect(async () => {
      const userCreated = await createUseUseCase.execute(user);

      await getStatementOperationUseCase.execute({
        user_id: userCreated.id as string,
        statement_id: "32424234243",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
