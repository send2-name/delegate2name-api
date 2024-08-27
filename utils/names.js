import axios from 'axios';
import { getProvider } from './network.js';

export async function getNames(address) {
  let apiError = false;
  let avatar = null;
  let ens = null;
  let farcaster = null;

  // fetch data from API using axios
  try {
    const response = await axios.get(`https://api.ensdata.net/${address}`, {timeout: 2500});
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

  // use blockchain lookup as a fallback
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