import { ethers } from 'ethers';

export function getAddress(addr) {
  if (!addr) {
    return null;
  }

  if (!ethers.utils.isAddress(addr)) {
    return null;
  }

  return ethers.utils.getAddress(addr);
}