import { TicketFactory } from './website/src/application/factories/TicketFactory.ts';

for (let i = 0; i < 100; i++) {
  try {
    const ticket = TicketFactory.createTicket('player1', 't1');
    if (i === 0) console.dir(ticket, { depth: null });
  } catch (err) {
    console.error("Error at iteration", i, err);
    process.exit(1);
  }
}
console.log("Success");
