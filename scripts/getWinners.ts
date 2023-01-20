import { ethers } from "hardhat";

const main = async () => {
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];
  const raffle = await ethers.getContract("Raffle", deployer);
  const winners = await raffle.queryFilter("randomWinnerPicked");

  for (let i = 0; i < winners.length; i++) {
    const recentWinner = winners![i].args!.recentWinner;
    const amountWon = ethers.utils.formatEther(winners![i].args!.amountWon);

    console.log(`Winner ${i + 1}: ${recentWinner} | Amount: ${amountWon}`);
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
