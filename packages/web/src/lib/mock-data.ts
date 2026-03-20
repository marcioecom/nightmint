export interface Bid {
  bidder: string;
  amount: string;
  timestamp: number;
}

export type AuctionStatus = "active" | "ended-unsettled" | "settling" | "settled" | "no-auction";

export interface Auction {
  nounId: number;
  currentBid: string;
  endTime: number;
  highestBidder: string;
  status: AuctionStatus;
  winner: string | null;
  bids: Bid[];
}

// Use a fixed timestamp to avoid SSR/client hydration mismatch
const now = 1742500000000;
const twentyFourHours = 24 * 60 * 60 * 1000;

export function getMockAuctions(): Auction[] {
  const currentTime = Date.now();
  return MOCK_AUCTIONS.map((auction) => ({
    ...auction,
    endTime: auction.status === "active" ? currentTime + twentyFourHours : auction.endTime,
  }));
}

export const MOCK_AUCTIONS: Auction[] = [
  {
    nounId: 42,
    currentBid: "0.42",
    endTime: now + twentyFourHours,
    highestBidder: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    status: "active",
    winner: null,
    bids: [
      { bidder: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b", amount: "0.42", timestamp: now - 2 * 60 * 1000 },
      { bidder: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1a2b3c4d", amount: "0.38", timestamp: now - 15 * 60 * 1000 },
      { bidder: "0x9c0d1e2f3a4b5c6d7e8f9a0b1a2b3c4d5e6f7a8b", amount: "0.35", timestamp: now - 60 * 60 * 1000 },
      { bidder: "0x3a4b5c6d7e8f9a0b1a2b3c4d5e6f7a8b9c0d1e2f", amount: "0.30", timestamp: now - 3 * 60 * 60 * 1000 },
      { bidder: "0x7e8f9a0b1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d", amount: "0.25", timestamp: now - 5 * 60 * 60 * 1000 },
    ],
  },
  {
    nounId: 41,
    currentBid: "0.55",
    endTime: now - 1000,
    highestBidder: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1a2b3c4d",
    status: "settled",
    winner: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1a2b3c4d",
    bids: [
      { bidder: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1a2b3c4d", amount: "0.55", timestamp: now - twentyFourHours - 30 * 60 * 1000 },
      { bidder: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b", amount: "0.50", timestamp: now - twentyFourHours - 2 * 60 * 60 * 1000 },
    ],
  },
];
