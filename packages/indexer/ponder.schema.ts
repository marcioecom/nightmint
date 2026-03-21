import { index, onchainTable } from "ponder";

export const auction = onchainTable(
  "auction",
  (t) => ({
    tokenId: t.bigint().primaryKey(),
    startTime: t.bigint().notNull(),
    endTime: t.bigint().notNull(),
    settled: t.boolean().notNull(),
    winner: t.hex(),
    winningBid: t.bigint(),
    bidCount: t.integer().notNull(),
  }),
  (table) => ({
    settledIdx: index().on(table.settled),
    winnerIdx: index().on(table.winner),
  }),
);

export const auctionEvent = onchainTable(
  "auction_event",
  (t) => ({
    id: t.text().primaryKey(),
    tokenId: t.bigint().notNull(),
    startTime: t.bigint().notNull(),
    endTime: t.bigint().notNull(),
  }),
  (table) => ({
    tokenIdIdx: index().on(table.tokenId),
  }),
);

export const bidEvent = onchainTable(
  "bid_event",
  (t) => ({
    id: t.text().primaryKey(),
    tokenId: t.bigint().notNull(),
    bidder: t.hex().notNull(),
    amount: t.bigint().notNull(),
    extended: t.boolean().notNull(),
    timestamp: t.integer().notNull(),
    blockNumber: t.bigint().notNull(),
    txHash: t.hex().notNull(),
  }),
  (table) => ({
    tokenIdIdx: index().on(table.tokenId),
    bidderIdx: index().on(table.bidder),
  }),
);

export const settledEvent = onchainTable(
  "settled_event",
  (t) => ({
    id: t.text().primaryKey(),
    tokenId: t.bigint().notNull(),
    winner: t.hex().notNull(),
    amount: t.bigint().notNull(),
  }),
  (table) => ({
    tokenIdIdx: index().on(table.tokenId),
    winnerIdx: index().on(table.winner),
  }),
);
