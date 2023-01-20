import { BigNumber } from "ethers";
import { ethers } from "hardhat";

export interface networkConfigItem {
  name?: string;
  blockConfirmations?: number;
  vrfCoordinatorV2?: string;
  entranceFee?: BigNumber;
  gasLane?: string;
  subscriptionId?: string;
  callbackGasLimit?: string;
  interval?: string;
}

export interface networkConfigInfo {
  [key: string]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
  1: {
    name: "mainnet",
    blockConfirmations: 6,
  },
  5: {
    name: "goerli",
    blockConfirmations: 6,
    vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
    entranceFee: ethers.utils.parseEther("0.01"),
    gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    subscriptionId: "8830",
    callbackGasLimit: "500000",
    interval: "30",
  },
  137: {
    name: "polygon",
    blockConfirmations: 6,
  },
  31337: {
    name: "hardhat",
    entranceFee: ethers.utils.parseEther("0.01"),
    gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    callbackGasLimit: "500000",
    interval: "30",
  },
};

// export const developmentChains = [31337];

export const developmentChains = ["hardhat", "localhost"];
