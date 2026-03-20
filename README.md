# NightMint

Daily NFT auction protocol. One NFT minted every 24 hours, auctioned automatically, proceeds sent to the DAO treasury.

## Architecture

Monorepo with two packages:

| Package | Description | Stack |
|---------|-------------|-------|
| [`packages/contracts`](packages/contracts) | Solidity protocol - token, auction house, on-chain metadata | Foundry, Solidity 0.8.28, OpenZeppelin |
| [`packages/web`](packages/web) | Auction frontend | Next.js 16, React 19, wagmi, Tailwind CSS v4 |

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 9
- [Foundry](https://book.getfoundry.sh/getting-started/installation)

## Setup

```bash
# Clone with submodules
git clone --recurse-submodules <repo-url>
cd nightmint

# Install JS dependencies
pnpm install

# Install Foundry dependencies
cd packages/contracts && forge install
```

## Development

```bash
# Start web dev server
pnpm dev

# Build contracts
pnpm forge:build

# Run contract tests
pnpm forge:test
```

## Project Structure

```
nightmint/
  packages/
    contracts/          # Solidity smart contracts (Foundry)
      src/              # Contract source files
      test/             # Forge tests
      script/           # Deploy scripts
    web/                # Next.js frontend
      src/
        app/            # App router pages and layout
        components/     # React components
        lib/            # Utilities and config
  docs/                 # Design system and specs
```

## License

MIT
