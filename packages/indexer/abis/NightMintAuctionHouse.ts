export const NightMintAuctionHouseAbi = [
  {
    type: "event",
    name: "AuctionCreated",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "startTime", type: "uint256", indexed: false },
      { name: "endTime", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "AuctionBid",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "bidder", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
      { name: "extended", type: "bool", indexed: false },
    ],
  },
  {
    type: "event",
    name: "AuctionExtended",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "endTime", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "AuctionSettled",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "winner", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;
