import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
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

      beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        raffle = await ethers.getContract("Raffle", deployer);
        raffleEntranceFee = await raffle.getEntranceFee();
      });

      describe("fulfillRandomWords()", () => {
        it("works with live Chainlink Keepers & Chainlink VRF, We get a random winner", async () => {
          console.log("Setting up test...");
          const startingTimestamp = await raffle.getLastTimeStamp();
          console.log(`startingTimestamp: ${startingTimestamp}`);

          console.log("Setting up Listener...");
          await new Promise<void>(async (resolve, reject) => {
            raffle.once("randomWinnerPicked", async () => {
              console.log("randomWinnerPicked event fired!");
              try {
                const recentWinner = await raffle.getRecentWinner();
                const raffleState = await raffle.getRaffleState();
                const endingTimestamp = await raffle.getLastTimeStamp();
                const winnerEndingBalance = await deployer.getBalance();

                console.log(`recentWinner: ${recentWinner}`);
                console.log(`winnerEndingBalance: ${winnerEndingBalance}`);
                console.log(`endingTimestamp: ${endingTimestamp}`);
                console.log(`raffleState: ${raffleState}`);

                await expect(raffle.getPlayer(0)).to.be.reverted;
                expect(recentWinner).to.equal(deployer.address);
                expect(raffleState).to.equal(0);
                expect(endingTimestamp.gt(startingTimestamp));
                expect(winnerEndingBalance).to.equal(
                  playerStartingBalance.add(raffleEntranceFee)
                );

                resolve();
              } catch (error) {
                reject(error);
              }
            });

            console.log("Entering Raffle...");
            const txnRes = await raffle.enterRaffle({ value: raffleEntranceFee });
            await txnRes.wait(1);

            const playerStartingBalance = await deployer.getBalance();
            console.log(`playerStartingBalance: ${playerStartingBalance}`);
            console.log("Now we wait...");
          });
        });
      });
    });
