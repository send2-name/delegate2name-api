import dotenv from 'dotenv'; 
import { fetchQuery, init } from "@airstack/node";
import { getEnvVar } from './datastore.js';

dotenv.config(); // Load environment variables from .env file

// get airstack api key
let apiKey;
if (process.env.MYLOCALHOST) {
  apiKey = process.env.AIRSTACK_API_KEY;
} else {
  apiKey = await getEnvVar("airstackApiKey");
}

init(apiKey);

export async function getAddressFromFid(fid) {
  // get fan token earnings query
  const query = `
    query MyQuery {
      Socials(input: {filter: {userId: {_eq: "${fid}"}}, blockchain: ethereum}) {
        Social {
          connectedAddresses {
            address
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

    let userAddress;

    console.log(result);

    try {
      userAddress = result?.data.Socials?.Social[0]?.connectedAddresses[0]?.address || [];
    } catch (e) {
      console.error("Error fetching user addresses by FID:");
      console.log(e);
      console.log(result);
      return { success: false, message: e };
    }

    return { success: true, userAddress: userAddress };
  } catch (e) {
    console.log(e);
    return { success: false, message: e };
  }
}