# Lottery Solidity Smart Contract

- `Raffle` contract deployed to the Goerli testnet: [0x36e35e2C56464eF28e9010E01672055d982ED6f9](https://goerli.etherscan.io/address/0x36e35e2C56464eF28e9010E01672055d982ED6f9)
- Frontend deployed to IPFS & Filecoin: [fragrant-bar-0579.on.fleek.co/](https://fragrant-bar-0579.on.fleek.co/) (using Fleek hosting for CI/CD)

Steps to run the staging tests:

1. Create a subscription with Chainlink VRF and fund it
2. Deploy the contract with the subscriptionId
3. Register the contract as a consumer with Chainlink VRF (contractAddress, subscriptionId)
4. Register the contract with Chainlink Keepers
5. Run stagin tests
