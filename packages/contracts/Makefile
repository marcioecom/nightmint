-include .env

.PHONY: all clean deploy deploy-sepolia help install build test test-gas format anvil

DEFAULT_ANVIL_KEY := 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

help:
	@echo "Usage:"
	@echo "  make install         - Install dependencies"
	@echo "  make build           - Build the project"
	@echo "  make test            - Run tests"
	@echo "  make test-gas        - Run tests with gas report"
	@echo "  make format          - Format code"
	@echo "  make anvil           - Start local Anvil chain"
	@echo "  make deploy          - Deploy to local Anvil"
	@echo "  make deploy-sepolia  - Deploy to Sepolia testnet"

all: clean install build

clean:; forge clean

install:; forge install

build:; forge build

test:; forge test -vvv

test-gas:; forge test --gas-report

format:; forge fmt

anvil:; anvil -m 'test test test test test test test test test test test junk' --steps-tracing --block-time 1

NETWORK_ARGS := --rpc-url http://localhost:8545 --private-key $(DEFAULT_ANVIL_KEY) --broadcast

VERIFY_ARGS :=
ifdef ETHERSCAN_API_KEY
	VERIFY_ARGS := --verify --etherscan-api-key $(ETHERSCAN_API_KEY)
endif

deploy:
	@forge script script/Deploy.s.sol:Deploy $(NETWORK_ARGS)

deploy-sepolia:
	@forge script script/Deploy.s.sol:Deploy --rpc-url $(SEPOLIA_RPC_URL) --account $(ACCOUNT) --sender $(ADDRESS) --broadcast $(VERIFY_ARGS) -vvvv
