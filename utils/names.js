import axios from 'axios';
import dotenv from 'dotenv';
import Moralis from 'moralis';
import { getEnvVar } from './datastore.js';
import { getProvider } from './network.js';

export async function getSocialsByAddress(address) {
  let apiError = false;
  let avatar = null;
  let ens = null;
  let farcaster = null;

  // fetch data from ENSdata API using axios
  const ensData = await getEnsFromEnsData(address);
  apiError = ensData?.apiError;

  if (!ensData.apiError) {
    ens = ensData?.ens;
    farcaster = ensData?.farcaster;
    avatar = ensData?.avatar;

    return {
      address: address,
      ens: ens,
      farcaster: farcaster,
      avatar: avatar,
    }
  }

  // FALLBACK 1: get ENS name from Moralis
  console.log(`Fetching ENS name for ${address} from Moralis`);

  const moralisData = await getEnsFromMoralis(address);
  apiError = moralisData?.apiError;

  if (!moralisData.apiError) {
    ens = moralisData?.ens;
    
    return {
      address: address,
      ens: ens,
      farcaster: farcaster,
      avatar: avatar,
    }
  }

  // FALLBACK 2: fetch directly from blockchain
  if (apiError) {
    const provider = getProvider(1);

    try {
      const ensName = await provider.lookupAddress(address);
      ens = ensName;
    } catch (err) {
      console.error(`Error fetching ENS name for ${address}: ${err}`);
    }
  }

  return {
    address: address,
    ens: ens,
    farcaster: farcaster,
    avatar: avatar,
  }
}

export async function getSocialsByEns(ens) {
  let apiError = false;
  let avatar = null;
  let address = null;
  let farcaster = null;

  // fetch data from ENSdata API using axios
  const ensData = await getAddressFromEnsData(ens);
  apiError = ensData?.apiError;

  if (!ensData.apiError) {
    address = ensData?.address;
    farcaster = ensData?.farcaster;
    avatar = ensData?.avatar;

    return {
      address: address,
      ens: ens,
      farcaster: farcaster,
      avatar: avatar,
    }
  }

  // FALLBACK 1: get address from Moralis
  console.log(`Fetching address for ${ens} from Moralis`);

  const moralisData = await getAddressFromNameMoralis(ens);
  apiError = moralisData?.apiError;

  if (!moralisData.apiError) {
    address = moralisData?.address;
    
    return {
      address: address,
      ens: ens,
      farcaster: farcaster,
      avatar: avatar,
    }
  }

  // FALLBACK 2: fetch directly from blockchain
  if (apiError) {
    const provider = getProvider(1);

    try {
      const ensAddress = await provider.resolveName(ens);
      address = ensAddress;
    } catch (err) {
      console.error(`Error fetching address for ENS name ${ens}: ${err}`);
    }
  }

  return {
    address: address,
    ens: ens,
    farcaster: farcaster,
    avatar: avatar,
  }
}

export async function getEnsFromEnsData(address) {
  let apiError = false;
  let avatar = null;
  let ens = null;
  let farcaster = null;

  try {
    const response = await axios.get(`https://api.ensdata.net/${address}`, {timeout: 1500});
    const data = response.data;

    if (data.error) {
      console.error(`Error fetching ENS name for ${address}: ${data?.message}`);
      apiError = true;
    } else {
      ens = data?.ens;
      farcaster = data?.farcaster?.username;
      avatar = data?.avatar;
      apiError = false;
    }
  } catch (err) {
    console.error(`Error fetching ENS name for ${address}: ${err}`);
    apiError = true;
  }

  return {
    address: address,
    ens: ens,
    farcaster: farcaster,
    avatar: avatar,
    apiError: apiError,
  }
}

export async function getEnsFromMoralis(address) {
  dotenv.config(); // Load environment variables from .env file

  // get moralis api key
  let apiKey;
  if (process.env.MYLOCALHOST) {
    apiKey = process.env.MORALIS_API_KEY;
  } else {
    apiKey = await getEnvVar("moralisApiKey");
  }

  try {
    await Moralis.start({
      apiKey: apiKey
    });
  
    const response = await Moralis.EvmApi.resolve.resolveAddress({
      "address": address
    });

    console.log(response.raw);

    return { address: address, ens: response.raw?.name, apiError: false };
  } catch (e) {
    console.error(e);
  }

  return { address: address, ens: null, apiError: true };
}

export async function getAddressFromEnsData(ens) {
  let apiError = false;
  let avatar = null;
  let address = null;
  let farcaster = null;

  try {
    const response = await axios.get(`https://api.ensdata.net/${ens}`, {timeout: 1500});
    const data = response.data;

    if (data.error) {
      console.error(`Error fetching address for ENS name ${ens}: ${data?.message}`);
      apiError = true;
    } else {
      address = data?.address;
      farcaster = data?.farcaster?.username;
      avatar = data?.avatar;
      apiError = false;
    }
  } catch (err) {
    console.error(`Error fetching address for ENS name ${ens}: ${err}`);
    apiError = true;
  }

  return {
    address: address,
    ens: ens,
    farcaster: farcaster,
    avatar: avatar,
    apiError: apiError,
  }
}

export async function getAddressFromNameMoralis(ens) {
  dotenv.config(); // Load environment variables from .env file

  // get moralis api key
  let apiKey;
  if (process.env.MYLOCALHOST) {
    apiKey = process.env.MORALIS_API_KEY;
  } else {
    apiKey = await getEnvVar("moralisApiKey");
  }

  try {
    await Moralis.start({
      apiKey: apiKey
    });
  
    const response = await Moralis.EvmApi.resolve.resolveENSDomain({
      "domain": ens
    });

    console.log(response.raw?.address);

    return response.raw?.address;
  } catch (e) {
    console.error(e);
  }

  return null;
}
