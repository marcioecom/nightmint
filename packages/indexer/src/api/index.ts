import { db } from "ponder:api";
import schema from "ponder:schema";
import { Hono } from "hono";
import { asc, count, desc, eq, graphql, sum } from "ponder";

const app = new Hono();

app.use("/graphql", graphql({ db, schema }));

function serialize<T extends Record<string, unknown>>(rows: T[]) {
  return rows.map((row) => {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) {
      out[k] = typeof v === "bigint" ? v.toString() : v;
    }
    return out;
  });
}

// GET /api/bids/:tokenId - bid history for an auction
app.get("/api/bids/:tokenId", async (c) => {
  const tokenId = BigInt(c.req.param("tokenId"));
  const rows = await db
    .select()
    .from(schema.bidEvent)
    .where(eq(schema.bidEvent.tokenId, tokenId))
    .orderBy(desc(schema.bidEvent.timestamp));
  return c.json(serialize(rows));
});

// GET /api/auctions - paginated, sorted, filtered auctions (gallery page)
// Query params: sort=recent|highest|lowest, limit=number, offset=number, settled=true|false
app.get("/api/auctions", async (c) => {
  const sort = c.req.query("sort") ?? "recent";
  const limit = Math.min(Number(c.req.query("limit") ?? "20"), 100);
  const offset = Number(c.req.query("offset") ?? "0");
  const settled = c.req.query("settled");

  const orderBy = (() => {
    switch (sort) {
      case "highest":
        return desc(schema.auction.winningBid);
      case "lowest":
        return asc(schema.auction.winningBid);
      default:
        return desc(schema.auction.tokenId);
    }
  })();

  const where =
    settled === "true"
      ? eq(schema.auction.settled, true)
      : settled === "false"
        ? eq(schema.auction.settled, false)
        : undefined;

  const [rows, [total]] = await Promise.all([
    db
      .select()
      .from(schema.auction)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
    db
      .select({
        count: count(),
        totalVolume: sum(schema.auction.winningBid),
      })
      .from(schema.auction)
      .where(where),
  ]);

  return c.json({
    items: serialize(rows),
    totalCount: total?.count ?? 0,
    totalVolume: (total?.totalVolume ?? 0n).toString(),
  });
});

// GET /api/auctions/:tokenId - single auction
app.get("/api/auctions/:tokenId", async (c) => {
  const tokenId = BigInt(c.req.param("tokenId"));
  const [row] = await db
    .select()
    .from(schema.auction)
    .where(eq(schema.auction.tokenId, tokenId))
    .limit(1);
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(serialize([row])[0]);
});

// GET /api/profile/:address/bids - bids by address (profile page)
app.get("/api/profile/:address/bids", async (c) => {
  const address = c.req.param("address").toLowerCase() as `0x${string}`;
  const rows = await db
    .select()
    .from(schema.bidEvent)
    .where(eq(schema.bidEvent.bidder, address))
    .orderBy(desc(schema.bidEvent.timestamp));
  return c.json(serialize(rows));
});

// GET /api/profile/:address/wins - auctions won by address (profile page)
app.get("/api/profile/:address/wins", async (c) => {
  const address = c.req.param("address").toLowerCase() as `0x${string}`;
  const rows = await db
    .select()
    .from(schema.auction)
    .where(eq(schema.auction.winner, address))
    .orderBy(desc(schema.auction.tokenId));
  return c.json(serialize(rows));
});

export default app;
