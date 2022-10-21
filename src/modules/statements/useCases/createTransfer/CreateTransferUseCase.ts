import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "../createStatement/CreateStatementError";

interface IRequest {
  receive_id: string;
  sender_id: string;
  amount: number;
  description: string;
}

@injectable()
export class CreateTransferUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ receive_id, sender_id, amount, description }: IRequest) {
    const type = "transfer" as OperationType;

    const receiveId = await this.usersRepository.findById(receive_id);

    if (!receiveId) {
      throw new CreateStatementError.UserNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({
      user_id: sender_id,
    });

    if (balance < amount) {
      throw new CreateStatementError.InsufficientFunds();
    }

    const statementOperation = await this.statementsRepository.create({
      user_id: receive_id,
      type,
      sender_id,
      amount,
      description,
    });

    return {
      id: statementOperation.id,
      sender_id: statementOperation.sender_id,
      amount: statementOperation.amount,
      description: statementOperation.description,
      type: statementOperation.type,
      created_at: statementOperation.created_at,
      updated_at: statementOperation.updated_at,
    };
  }
}
