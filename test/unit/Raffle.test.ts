import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { developmentChains, networkConfig } from "../../helper-hardhat-config";
import { Raffle, VRFCoordinatorV2Mock } from "../../typechain-types";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle unit tests", async () => {
      let raffle: Raffle,
        vrfCoordinatorV2Mock: VRFCoordinatorV2Mock,
        raffleEntranceFee: BigNumber,
        deployer: SignerWithAddress;
      const chainId: number = network.config.chainId!;

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];

        await deployments.fixture(["all"]);
        raffle = await ethers.getContract("Raffle", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
        raffleEntranceFee = await raffle.getEntranceFee();
      });

      describe("constructor()", async () => {
        it("intialises the raffle correctly", async () => {
          const raffleState = await raffle.getRaffleState();
          const interval = await raffle.getInterval();

          expect(raffleState.toString()).to.equal("0");
          expect(interval.toString()).to.equal(networkConfig[chainId]["interval"]);
        });
      });

      describe("enterRaffle()", async () => {
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
            "raffleEntered "
          );
        });

        it("doesn't allow entrance when raffle is calculating", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
        });
      });
    });
