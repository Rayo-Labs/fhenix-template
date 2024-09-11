import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

const hre = require("hardhat");

const func: DeployFunction = async function () {
  const { fhenixjs, ethers } = hre;
  const { deploy } = hre.deployments;
  const [signer] = await ethers.getSigners();

  if ((await ethers.provider.getBalance(signer.address)).toString() === "0") {
    if (hre.network.name === "localfhenix") {
      await fhenixjs.getFunds(signer.address);
    } else {
      console.log(
        chalk.red(
          "Please fund your account with testnet FHE from https://faucet.fhenix.zone",
        ),
      );
      return;
    }
  }

  const weerc20 = await deploy("FhenixWEERC20", {
    from: signer.address,
    args: ["Fhenix Wrapped Ether", "FWE"],
    log: true,
    skipIfAlreadyDeployed: false,
  });

  const bridge = await deploy("FhenixBridge", {
    from: signer.address,
    args: [weerc20.address],
    log: true,
    skipIfAlreadyDeployed: false,
  });

  console.log("Signer address: ", signer.address);
  console.log(`Token contract: `, weerc20.address);
  console.log(`Bridge contract: `, bridge.address);
};

export default func;
func.id = "deploy_contract";
func.tags = ["Contract"];
