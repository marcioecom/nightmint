import { ponder } from "ponder:registry";
import schema from "ponder:schema";

ponder.on("NightMintAuctionHouse:AuctionCreated", async ({ event, context }) => {
  await context.db.insert(schema.auctionEvent).values({
    id: event.id,
    tokenId: event.args.tokenId,
    startTime: event.args.startTime,
    endTime: event.args.endTime,
  });

  await context.db.insert(schema.auction).values({
    tokenId: event.args.tokenId,
    startTime: event.args.startTime,
    endTime: event.args.endTime,
    settled: false,
    bidCount: 0,
  });
});

ponder.on("NightMintAuctionHouse:AuctionBid", async ({ event, context }) => {
  await context.db.insert(schema.bidEvent).values({
    id: event.id,
    tokenId: event.args.tokenId,
    bidder: event.args.bidder,
    amount: event.args.amount,
    extended: event.args.extended,
    timestamp: Number(event.block.timestamp),
    blockNumber: event.block.number,
    txHash: event.transaction.hash,
  });

  await context.db
    .update(schema.auction, { tokenId: event.args.tokenId })
    .set((row) => ({ bidCount: row.bidCount + 1 }));
});

ponder.on("NightMintAuctionHouse:AuctionExtended", async ({ event, context }) => {
  await context.db
    .update(schema.auction, { tokenId: event.args.tokenId })
    .set({ endTime: event.args.endTime });
});

ponder.on("NightMintAuctionHouse:AuctionSettled", async ({ event, context }) => {
  await context.db.insert(schema.settledEvent).values({
    id: event.id,
    tokenId: event.args.tokenId,
    winner: event.args.winner,
    amount: event.args.amount,
  });

  await context.db
    .update(schema.auction, { tokenId: event.args.tokenId })
    .set({
      settled: true,
      winner: event.args.winner,
      winningBid: event.args.amount,
    });
});
