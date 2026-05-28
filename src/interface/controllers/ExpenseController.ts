import { Response } from "express";
import { AuthenticatedRequest } from "../../infrastructure/webserver/express/middlewares/AuthMiddleware";
import { CreateExpense } from "../../application/use-cases/CreateExpense";
import { ListExpenses } from "../../application/use-cases/ListExpenses";
import { DeleteExpense } from "../../application/use-cases/DeleteExpense";

export class ExpenseController {
  constructor(
    private createExpense: CreateExpense,
    private listExpenses: ListExpenses,
    private deleteExpense: DeleteExpense
  ) {}

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { description, amount, category, date } = req.body;

    const result = await this.createExpense.execute({
      tenantId: req.user!.tenantId,
      description,
      amount: Number(amount),
      category,
      date,
      createdBy: req.user!.id,
    });

    res.status(201).json(result);
  }

  async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { startDate, endDate } = req.query;

    const expenses = await this.listExpenses.execute({
      tenantId: req.user!.tenantId,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    res.json(expenses);
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const result = await this.deleteExpense.execute({
      tenantId: req.user!.tenantId,
      id,
    });

    res.json({ success: result });
  }
}
