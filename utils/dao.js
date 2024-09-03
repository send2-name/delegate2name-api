import { ethers } from 'ethers';

const arbAddress = "0x912CE59144191C1204E64559FE8253a0e49E6548";
const opAddress = "0x4200000000000000000000000000000000000042";

export function getArbAddress() {
  return arbAddress;
}

export async function getArbitrumDelegate(userAddress, provider) {
  const intrfc = new ethers.utils.Interface([
    "function delegates(address account) external view returns (address)",
  ]);

  const contract = new ethers.Contract(arbAddress, intrfc, provider);

  try {
    const delegate = await contract.delegates(userAddress);

    if (delegate === ethers.constants.AddressZero) {
      return { success: true, error: null, msg: "No delegate found", delegate: null };
    }

    return { success: true, error: null, msg: "Delegate found", delegate: delegate };
  } catch (err) {
    console.error(err);
    return { success: false, error: err, msg: "Blockchain call error", delegate: null };
  } 
}

export function getOpAddress() {
  return opAddress;
}

export async function getOptimismDelegate(userAddress, provider) {
  const intrfc = new ethers.utils.Interface([
    "function delegates(address account) external view returns (address)",
  ]);

  const contract = new ethers.Contract(opAddress, intrfc, provider);

  try {
    const delegate = await contract.delegates(userAddress);

    if (delegate === ethers.constants.AddressZero) {
      return { success: true, error: null, msg: "No delegate found", delegate: null };
    }

    return { success: true, error: null, msg: "Delegate found", delegate: delegate };
  } catch (err) {
    console.error(err);
    return { success: false, error: err, msg: "Blockchain call error", delegate: null };
  } 
}