import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { deployments, ethers, network } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";
import { Raffle } from "../../typechain-types";

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle staging tests", () => {
      let raffle: Raffle,
        accounts: SignerWithAddress[],
        deployer: SignerWithAddress,
        raffleEntranceFee: BigNumber;
      const chainId: number = network.config.chainId!;

      beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        raffle = await ethers.getContract("Raffle", deployer);
        raffleEntranceFee = await raffle.getEntranceFee();
      });
    });
