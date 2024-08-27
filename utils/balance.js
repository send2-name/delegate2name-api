import { ethers } from 'ethers';
import { getArbAddress } from './dao.js';

export async function getArbBalance(userAddress, provider, precision=4) {
  const arbAddress = getArbAddress();
  
  const intrfc = new ethers.utils.Interface([
    "function balanceOf(address account) external view returns (uint256)",
  ]);

  const contract = new ethers.Contract(arbAddress, intrfc, provider);

  try {
    const balance = await contract.balanceOf(userAddress);
    const balancePrecision = Number(ethers.utils.formatUnits(balance, 18)).toFixed(precision);
    return Number.parseFloat(balancePrecision);
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getNativeBalance(userAddress, provider, precision=4) {
  const balanceWei = await provider.getBalance(userAddress);
  const balance = ethers.utils.formatEther(balanceWei);

  const balancePrecision = Number(balance).toFixed(precision);
  return Number.parseFloat(balancePrecision);
}