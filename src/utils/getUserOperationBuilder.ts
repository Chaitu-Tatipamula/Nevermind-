import { BigNumber } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils";
import { UserOperationBuilder } from "userop";
import { estimateGas } from "thirdweb";


export async function getUserOperationBuilder(
  walletContract: string,
  nonce: BigNumber,
  initCode: Uint8Array,
  encodedCallData: string,
  signatures: string[]
) {

  try {
    
    const maxPriorityFeePerGas = BigNumber.from("100000000"); 
    const maxFeePerGas = BigNumber.from("1000000000"); 
    const callGasLimit = BigNumber.from("500000"); 
    console.log(maxPriorityFeePerGas);
    console.log(maxFeePerGas.toHexString);
    
    const encodedSignatures = defaultAbiCoder.encode(["bytes[]"], [signatures]);
    const builder = new UserOperationBuilder()
      .useDefaults({
        preVerificationGas: 100_000,
        callGasLimit: 500000,
        verificationGasLimit: 2_000_000,
        maxPriorityFeePerGas : maxPriorityFeePerGas.toHexString(),
        maxFeePerGas : maxFeePerGas.toHexString()
      })
      .setSender(walletContract)
      .setNonce(nonce)
      .setCallData(encodedCallData)
      .setSignature(encodedSignatures)
      .setInitCode(initCode)
      .setCallGasLimit(callGasLimit.toHexString())
      .setMaxPriorityFeePerGas(maxPriorityFeePerGas.toHexString())
      .setMaxFeePerGas(maxFeePerGas.toHexString())

      console.log("get builder",builder);
      
    return builder;
  } catch (e) {
    console.error(e);
    throw e;
  }
}
