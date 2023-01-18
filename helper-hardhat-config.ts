import { BigNumber } from "ethers";
import { ethers } from "hardhat";

export interface networkConfigItem {
  name?: string;
  blockConfirmations?: number;
  vrfCoordinatorV2?: string;
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
  },
  137: {
    name: "polygon",
    blockConfirmations: 6,
  },
};

// export const developmentChains = [31337];

export const developmentChains = ["hardhat", "localhost"];
