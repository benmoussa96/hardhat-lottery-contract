# Sample Hardhat Project

Steps to run the staging tests:

1. Create a subscription with Chainlink VRF and fund it
2. Deploy the contract with the subscriptionId
3. Register the contract as a consumer with Chainlink VRF (contractAddress, subscriptionId)
4. Register the contract with Chainlink Keepers
5. Run stagin tests
