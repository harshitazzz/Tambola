import type { Ticket } from "../../domain/entities/Ticket";
import { TicketFactory } from "../factories/TicketFactory";

export interface IGenerateTicketUseCase {
  execute(playerId: string, ticketId: string): Ticket;
}

export class GenerateTicketUseCase implements IGenerateTicketUseCase {
  public execute(playerId: string, ticketId: string): Ticket {
    return TicketFactory.createTicket(playerId, ticketId);
  }
}
