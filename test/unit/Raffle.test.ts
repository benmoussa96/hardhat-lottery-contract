import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { deployments, ethers, network } from "hardhat";
import { developmentChains, networkConfig } from "../../helper-hardhat-config";
import { Raffle, VRFCoordinatorV2Mock } from "../../typechain-types";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle unit tests", () => {
      let raffle: Raffle,
        vrfCoordinatorV2Mock: VRFCoordinatorV2Mock,
        deployer: SignerWithAddress,
        raffleEntranceFee: BigNumber,
        interval: BigNumber;
      const chainId: number = network.config.chainId!;

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];

        await deployments.fixture(["all"]);
        raffle = await ethers.getContract("Raffle", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
        raffleEntranceFee = await raffle.getEntranceFee();
        interval = await raffle.getInterval();
      });

      describe("constructor()", () => {
        it("intialises the raffle correctly", async () => {
          const raffleState = await raffle.getRaffleState();
          const interval = await raffle.getInterval();

          expect(raffleState.toString()).to.equal("0");
          expect(interval.toString()).to.equal(networkConfig[chainId]["interval"]);
        });
      });

      describe("enterRaffle()", () => {
        it("reverts when you don't pay enough", async () => {
          await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(
            raffle,
            "Raffle__NotEnoughETHEntered"
          );
        });

        it("records players when they enter the raffle", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          const player = await raffle.getPlayer(0);
          expect(player).to.equal(deployer.address);
        });

        it("emits an event when a player enters the raffle", async () => {
          await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(
            raffle,
            "raffleEntered"
          );
        });

        it("doesn't allow entrance when raffle is calculating", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
          await network.provider.send("evm_mine", []);

          // pretend to be a chainlink keeper:
          await raffle.performUpkeep([]);

          await expect(
            raffle.enterRaffle({ value: raffleEntranceFee })
          ).to.be.revertedWithCustomError(raffle, "Raffle__NotOpen");
        });
      });

      describe("checkUpkeep()", () => {
        it("returns false if people haven't sent any ETH", async () => {
          await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
          await network.provider.send("evm_mine", []);

          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
          expect(upkeepNeeded).to.be.false;
        });

        it("returns false if the raffle isn't open", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
          await network.provider.send("evm_mine", []);
          await raffle.performUpkeep([]);

          const raffleState = await raffle.getRaffleState();
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);

          expect(raffleState).to.equal(1);
          expect(upkeepNeeded).to.be.false;
        });
      });
    });
