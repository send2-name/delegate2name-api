import axios from 'axios';
import dotenv from 'dotenv';
import Moralis from 'moralis';
import { getEnvVar } from './datastore.js';
import { getProvider } from './network.js';

export async function getNames(address) {
  let apiError = false;
  let avatar = null;
  let ens = null;
  let farcaster = null;

  // fetch data from ENSdata API using axios
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

  // FALLBACK 1: get ENS name from Moralis
  console.log(`Fetching ENS name for ${address} from Moralis`);

  ens = await getEnsFromMoralis(address);

  console.log(`ENS name for ${address} from Moralis: ${ens}`);

  if (ens) {
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
      return ensName;
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
  
    console.log(response);
    console.log(response.raw);
    console.log(response.raw?.name);

    return response.raw?.name;
  } catch (e) {
    console.error(e);
  }

  return null;
}
