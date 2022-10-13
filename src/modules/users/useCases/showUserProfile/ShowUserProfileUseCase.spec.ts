import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let createUseUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show Profile User UseCase", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUseUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to return authenticated user profile", async () => {
    const user = {
      name: "test",
      email: "test@email.com",
      password: "test1234",
    };

    const userCreated = await createUseUseCase.execute(user);

    const userProfile = await showUserProfileUseCase.execute(
      userCreated.id as string
    );

    expect(userProfile).toEqual(userCreated);
  });

  it("should not be able to return the profile of an unauthenticated user", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("23424234234");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
