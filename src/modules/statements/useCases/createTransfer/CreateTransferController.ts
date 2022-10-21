import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

export class CreateTransferController {
  async handle(req: Request, res: Response) {
    const { receive_id } = req.params;
    const { id } = req.user;
    const { amount, description } = req.body;

    const createTransferUseCase = container.resolve(CreateTransferUseCase);

    const createdTransfer = await createTransferUseCase.execute({
      amount,
      description,
      receive_id,
      sender_id: id,
    });

    return res.status(201).json(createdTransfer);
  }
}
