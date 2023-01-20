# Sample Hardhat Project

`Raffle` contract deployed at: [0xc88557F3c18F4aC4F4Cf237d9750d0e4cBD3Ec6d](https://goerli.etherscan.io/address/0xc88557F3c18F4aC4F4Cf237d9750d0e4cBD3Ec6d)

Steps to run the staging tests:

1. Create a subscription with Chainlink VRF and fund it
2. Deploy the contract with the subscriptionId
3. Register the contract as a consumer with Chainlink VRF (contractAddress, subscriptionId)
4. Register the contract with Chainlink Keepers
5. Run stagin tests
