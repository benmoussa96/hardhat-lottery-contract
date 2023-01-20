import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { assert } from "console";
import { BigNumber } from "ethers";
import { deployments, ethers, network } from "hardhat";
import { developmentChains, networkConfig } from "../../helper-hardhat-config";
import { Raffle, VRFCoordinatorV2Mock } from "../../typechain-types";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle unit tests", () => {
      let raffle: Raffle,
        vrfCoordinatorV2Mock: VRFCoordinatorV2Mock,
        accounts: SignerWithAddress[],
        deployer: SignerWithAddress,
        raffleEntranceFee: BigNumber,
        interval: BigNumber;
      const chainId: number = network.config.chainId!;

      beforeEach(async () => {
        accounts = await ethers.getSigners();
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
          const NUM_WORDS = await raffle.getNumWords();
          const REQUEST_CONFIRMATIONS = await raffle.getRequestConfirmations();

          expect(raffleState.toString()).to.equal("0");
          expect(interval.toString()).to.equal(networkConfig[chainId]["interval"]);
          expect(NUM_WORDS).to.equal(1);
          expect(REQUEST_CONFIRMATIONS).to.equal(3);
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

      describe("performUpkeep()", () => {
        it("only runs when checkUpkeep returns true", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
          await network.provider.send("evm_mine", []);

          const txn = await raffle.performUpkeep([]);
          expect(txn);
        });

        it("reverts when checkUpkeep returns false", async () => {
          await expect(raffle.performUpkeep([])).to.be.revertedWithCustomError(
            raffle,
            "Raffle__UpkeepNotNeeded"
          );
        });

        it("updates the raffle state, emits event and calls the vrf coordinator", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
          await network.provider.send("evm_mine", []);

          const txnResponse = await raffle.performUpkeep([]);
          const txnReceipt = await txnResponse.wait(1);
          const requestId = txnReceipt.events![1].args!.requestId;
          const raffleState = await raffle.getRaffleState();

          expect(requestId).to.be.greaterThan(0);
          expect(raffleState).to.equal(1);
        });
      });

      describe("fulfillRandomWords()", () => {
        beforeEach(async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
          await network.provider.send("evm_mine", []);
        });

        it("only runs after performUpkeep", async () => {
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)
          ).to.be.revertedWith("nonexistent request");
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address)
          ).to.be.revertedWith("nonexistent request");
        });

        it("picks a winner, resets, and sends money", async () => {
          const originalEntrance = 1;
          const additionalEntrances = 3;
          const totalEntrances = originalEntrance + additionalEntrances;

          for (let i = originalEntrance; i < totalEntrances; i++) {
            const accountConnectedRaffle = raffle.connect(accounts[i]);
            await accountConnectedRaffle.enterRaffle({ value: raffleEntranceFee });
          }

          const startingTimestamp = await raffle.getLastTimeStamp();

          // Step 1. Call performUpkeep() (mock being a Chainlink keeper)
          // Step 2. Wait for fulfillRandomWords() to be called (mock being a Chainlink VRF)
          await new Promise<void>(async (resolve, reject) => {
            // Setting up the listener
            raffle.once("randomWinnerPicked", async () => {
              try {
                const recentWinner = await raffle.getRecentWinner();
                const raffleState = await raffle.getRaffleState();
                const endingTimestamp = await raffle.getLastTimeStamp();
                const numPlayers = await raffle.getNumberOfPlayers();
                const winnerEndingBalance = await accounts[1].getBalance();

                expect(recentWinner).to.equal(accounts[1].address);
                expect(numPlayers).to.equal(0);
                expect(raffleState).to.equal(0);
                expect(endingTimestamp.gt(startingTimestamp));
                expect(winnerEndingBalance).to.equal(
                  winnerStartingBalance.add(raffleEntranceFee.mul(totalEntrances))
                );

                resolve();
              } catch (error) {
                reject(error);
              }
            });

            // Fire the event. The listener should pick it up and resolve
            const txnResponse = await raffle.performUpkeep("0x");
            const txnReceipt = await txnResponse.wait(1);
            const winnerStartingBalance = await accounts[1].getBalance();
            await vrfCoordinatorV2Mock.fulfillRandomWords(
              txnReceipt.events![1].args!.requestId,
              raffle.address
            );
          });
        });
      });
    });
