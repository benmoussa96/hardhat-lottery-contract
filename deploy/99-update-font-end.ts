import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import verify from "../utils/verify";

import fs from "fs";

const FRONTEND_ADDRESSES_LOCATION =
  "../nextjs-lottery-frontend/constants/contractAddresses.json";
const FRONTEND_ABI_FILE = "../nextjs-lottery-frontend/constants/abi.json";

const updateFrontEnd: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
  network,
}: HardhatRuntimeEnvironment) {
  const chainId: number = network.config.chainId!;

  if (process.env.UPDATE_FRONT_END) {
    console.log("Updating frontend...");
    await updateContractAddresses(chainId.toString());
    await updateAbi();
  }
};

const updateAbi = async () => {
  const raffle = await ethers.getContract("Raffle");
  fs.writeFileSync(
    FRONTEND_ABI_FILE,
    raffle.interface.format(ethers.utils.FormatTypes.json).toString()
  );
};

const updateContractAddresses = async (chainId: string) => {
  const raffle = await ethers.getContract("Raffle");
  const contractAddresses = JSON.parse(
    fs.readFileSync(FRONTEND_ADDRESSES_LOCATION, "utf8")
  );

  if (
    chainId in contractAddresses &&
    !contractAddresses[chainId].includes(raffle.address)
  ) {
    contractAddresses[chainId].push(raffle.address);
  } else {
    contractAddresses[chainId] = [raffle.address];
  }

  fs.writeFileSync(FRONTEND_ADDRESSES_LOCATION, JSON.stringify(contractAddresses));
};

export default updateFrontEnd;
updateFrontEnd.tags = ["all", "frontend "];
