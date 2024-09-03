import { ethers } from 'ethers';

export async function getNativeBalance(userAddress, provider, precision=4) {
  const balanceWei = await provider.getBalance(userAddress);
  const balance = ethers.utils.formatEther(balanceWei);

  const balancePrecision = Number(balance).toFixed(precision);
  return Number.parseFloat(balancePrecision);
}

export async function getTokenBalance(userAddress, tokenAddress, provider, tokenDecimals, precision=4) {
  const intrfc = new ethers.utils.Interface([
    "function balanceOf(address account) external view returns (uint256)",
  ]);

  const contract = new ethers.Contract(tokenAddress, intrfc, provider);

  try {
    const balance = await contract.balanceOf(userAddress);
    const balancePrecision = Number(ethers.utils.formatUnits(balance, Number(tokenDecimals))).toFixed(Number(precision));
    return Number.parseFloat(balancePrecision);
  } catch (err) {
    console.error(err);
    return null;
  }
}
