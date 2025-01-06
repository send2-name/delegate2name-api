import { ethers } from 'ethers';

export function getProvider(chainId) {
  const rpc = chains.find((c) => Number(c.chainId) === Number(chainId))?.rpcs[0];
  return new ethers.providers.JsonRpcProvider(rpc);
}

const chains = [
  {
    chainId: 1,
    name: 'Ethereum',
    currency: 'ETH',
    rpcs: ['https://rpc.ankr.com/eth'],
    blockExplorer: 'https://etherscan.io',
  },
  {
    chainId: 10,
    name: 'Optimism',
    currency: 'ETH',
    rpcs: ['https://rpc.ankr.com/optimism'],
    blockExplorer: 'https://optimistic.etherscan.io',
  },
  {
    chainId: 324,
    name: 'ZKsync Era',
    currency: 'ETH',
    rpcs: ['https://mainnet.era.zksync.io'],
    blockExplorer: 'https://era.zksync.network',
  },
  {
    chainId: 42161,
    name: 'Arbitrum',
    currency: 'ETH',
    rpcs: ['https://rpc.ankr.com/arbitrum'],
    blockExplorer: 'https://arbiscan.io',
  },
];