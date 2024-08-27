import { ethers } from 'ethers';

export function getAddress(addr) {
  console.log(`User address 1: ${userAddress}`);

  if (!addr) {
    return null;
  }

  if (!ethers.utils.isAddress(addr)) {
    console.log(`Invalid address: ${addr}`);
    return null;
  }

  console.log(`User address 2: ${userAddress}`);

  return ethers.utils.getAddress(addr);
}