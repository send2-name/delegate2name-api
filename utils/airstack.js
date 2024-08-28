import dotenv from 'dotenv';
import { ethers } from 'ethers'; 
import { fetchQuery, init } from "@airstack/node";
import { getEnvVar } from './datastore.js';
import { getNames } from './names.js';

dotenv.config(); // Load environment variables from .env file

// get airstack api key
let apiKey;
if (process.env.MYLOCALHOST) {
  apiKey = process.env.AIRSTACK_API_KEY;
} else {
  apiKey = await getEnvVar("airstackApiKey");
}

init(apiKey);

export async function getSocialsFromAddress(address) {
  // get fan token earnings query
  const query = `
    query MyQuery {
      Socials(
        input: {filter: {userAssociatedAddresses: {_eq: "${address}"}}, blockchain: ethereum}
      ) {
        Social {
          connectedAddresses {
            address
          }
          profileHandle
          profileImage
          userAssociatedAddressDetails {
            primaryDomain {
              name
              resolvedAddress
            }
          }
        }
      }
    }
  `;

  try {
    const result = await fetchQuery(query);
    const error = result?.error || null;

    if (error) {
      console.error(error);
      return { success: false, message: error };
    }

    console.log(result);

    const socialsArray = result?.data.Socials?.Social || [];

    for (let i = 0; i < socialsArray.length; i++) {
      const connectedAddresses = result?.data.Socials?.Social[0]?.connectedAddresses || [];
      let userAddress;

      for (let i = 0; i < connectedAddresses.length; i++) {
        // if is a valid EVM address (to avoid using a non-EVM address)
        if (ethers.utils.isAddress(connectedAddresses[i]?.address)) {
          userAddress = connectedAddresses[i]?.address;
          break;
        }
      }

      if (String(userAddress).toLowerCase() !== String(address).toLowerCase()) {
        const profileHandle = socialsArray[i]?.profileHandle || null;
        const profileImage = socialsArray[i]?.profileImage || null;
        let ensName;
        const associatedAddresses = socialsArray[i]?.userAssociatedAddressDetails || [];

        for (let j = 0; j < associatedAddresses.length; j++) {
          if (String(associatedAddresses[j].primaryDomain?.resolvedAddress).toLowerCase() === String(userAddress).toLowerCase()) {
            ensName = associatedAddresses[j].primaryDomain?.name;
            break;
          }
        }

        return { success: true, userAddress, farcaster: profileHandle, avatar: profileImage, ens: ensName };
      }
    }
  } catch (e) {
    console.log(e);
    return { success: false, message: e, userAddress: address, farcaster: null, avatar: null, ens: null };
  }

  console.log("No socials found for this address:", address);

  console.log("Fetching socials from ENSdata API...");

  const namesQuery = await getNames(address); 

  return { 
    success: true, 
    userAddress: address, 
    farcaster: namesQuery?.farcaster, 
    avatar: namesQuery?.avatar, 
    ens: namesQuery?.ens 
  };
}

export async function getSocialsFromFid(fid) {
  // get fan token earnings query
  const query = `
    query MyQuery {
      Socials(input: {filter: {userId: {_eq: "${fid}"}}, blockchain: ethereum}) {
        Social {
          connectedAddresses {
            address
          }
          profileHandle
          profileImage
          userAssociatedAddressDetails {
            primaryDomain {
              name
              resolvedAddress
            }
          }
        }
      }
    }
  `;

  try {
    const result = await fetchQuery(query);

    console.log(result);

    const error = result?.error || null;

    if (error) {
      console.error(error);
      return { success: false, message: error };
    }

    const connectedAddresses = result?.data.Socials?.Social[0]?.connectedAddresses || [];
    let userAddress;

    for (let i = 0; i < connectedAddresses.length; i++) {
      // if is a valid EVM address (to avoid using a non-EVM address)
      if (ethers.utils.isAddress(connectedAddresses[i]?.address)) {
        userAddress = connectedAddresses[i]?.address;
        break;
      }
    }

    const profileHandle = result?.data.Socials?.Social[0]?.profileHandle || null;
    const profileImage = result?.data.Socials?.Social[0]?.profileImage || null;
    let ensName;
    const associatedAddresses = result?.data.Socials?.Social[0]?.userAssociatedAddressDetails || null;

    for (let i = 0; i < associatedAddresses.length; i++) {
      if (String(associatedAddresses[i].primaryDomain?.resolvedAddress).toLowerCase() === String(userAddress).toLowerCase()) {
        ensName = associatedAddresses[i].primaryDomain?.name;
        break;
      }
    }

    return { success: true, userAddress, farcaster: profileHandle, avatar: profileImage, ens: ensName };
  } catch (e) {
    console.log(e);
    return { success: false, message: e };
  }
}