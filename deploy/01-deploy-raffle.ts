import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
// import verify from "../utils/verify";

const deployRaffle: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
  network,
}: HardhatRuntimeEnvironment) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId: number = network.config.chainId!;

  let vrfCoordinatorV2;

  if (developmentChains.includes(network.name)) {
    const vrfCoordinatorV2Mock = await deployments.get("VRFCoordinatorV2Mock");
    vrfCoordinatorV2 = vrfCoordinatorV2Mock.address;
  } else {
    vrfCoordinatorV2 = networkConfig[chainId]["vrfCoordinatorV2"];
  }

  const raffle = await deploy("Raffle", {
    from: deployer,
    args: [vrfCoordinatorV2],
    log: true,
    waitConfirmations: networkConfig[chainId]?.blockConfirmations || 1,
  });
};

export default deployRaffle;
deployRaffle.tags = ["all", "raffle"];
