import { BigNumber } from "ethers";
import { concat } from "ethers/lib/utils";
import {
  entryPointContract,
  getWalletContract,
  walletFactoryContract,
} from "./getContracts";
import { getUserOperationBuilder } from "./getUserOperationBuilder";
import { createThirdwebClient } from "thirdweb";

const thirdWebClient = createThirdwebClient({
  clientId: "e514d98407e46ade19bddb4b0332d779",
});

export async function getUserOpForETHTransfer(
  walletAddress: string,
  owners: string[],
  salt: string,
  toAddress: string,
  value: BigNumber,
  isDeployed?: boolean
) {
  try {
    // Generate InitCode if the wallet is not deployed
    let initCode = Uint8Array.from([]);
    if (!isDeployed) {
      const data = walletFactoryContract.interface.encodeFunctionData(
        "createAccount",
        [owners, salt]
      );
      initCode = concat([walletFactoryContract.address, data]);
    }

    // Get the current nonce for the wallet
    const nonce: BigNumber = await entryPointContract.getNonce(walletAddress, 0);

    // Encode call data for the transfer
    const walletContract = getWalletContract(walletAddress);
    const encodedCallData = walletContract.interface.encodeFunctionData(
      "execute",
      [toAddress, value, initCode]
    );

    // Build UserOperation
    const builder = await getUserOperationBuilder(
      walletContract.address,
      nonce,
      initCode,
      encodedCallData,
      []
    );

    const userOp = builder.getOp();
    console.log("Constructed UserOperation:", userOp);

    // Encode UserOperation for sending to the EntryPoint contract
    const entryPointTx = await entryPointContract.handleOps(
      [userOp], // Single operation or array of operations
      walletAddress // Beneficiary address for fees
    );

    console.log("Transaction sent:", entryPointTx);

    // Await transaction confirmation
    const receipt = await entryPointTx.wait();
    console.log("Transaction confirmed:", receipt);

    return receipt;
  } catch (e) {
    console.error("Error in getUserOpForETHTransfer:", e);
    if (e instanceof Error) {
      window.alert(e.message);
    }
  }
}
