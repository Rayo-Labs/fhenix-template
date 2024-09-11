import { exec } from "child_process";
import tokenDeployment from "../../deployments/testnet/FhenixWEERC20.json";
import bridgeDeployment from "../../deployments/testnet/FhenixBridge.json";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function command(cmd: string) {
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return;
    }

    console.log(`Result: ${stdout}`);
  });

  await sleep(4000);
}

async function main() {
  const commands = [
    "ts-node ./test/fhenix/TokenContractScript.ts 1 wrap 10",
    `ts-node ./test/fhenix/TokenContractScript.ts 1 approveEncrypted ${bridgeDeployment.address} 10`,
    "ts-node ./test/fhenix/TokenContractScript.ts 1 encryptedBalanceOf",
    `ts-node ./test/fhenix/TokenContractScript.ts 1 balanceOf ${bridgeDeployment.address}`,
    "ts-node ./test/fhenix/BridgeContractScript.ts 1 bridgeWEERC20 0x5Bd64FFc654CBD6c5fa92CDf88A158059656F477 2",
    "ts-node ./test/fhenix/TokenContractScript.ts 1 encryptedBalanceOf",
    `ts-node ./test/fhenix/TokenContractScript.ts 1 balanceOf ${bridgeDeployment.address}`,
    //"ts-node ./test/fhenix/BridgeContractScript.ts 1 withdraw 2",
  ];

  for (const cmd of commands) {
    await command(cmd);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
