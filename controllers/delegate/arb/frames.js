import { getSocialsFromAddress, getSocialsFromFid } from "../../../utils/airstack.js";
import { getPageUrl } from "../../../utils/request.js";
import { getArbBalance } from '../../../utils/balance.js';
import { getArbitrumDelegate } from '../../../utils/dao.js';
import { getNames } from '../../../utils/names.js';
import { getProvider } from '../../../utils/network.js';
import { getAddress } from "../../../utils/sanitize.js";
import { validateFramesMessage } from "../../../utils/validate.js";

const chainId = 42161;

export function arbDelegateStart1(request, reply) {
  const timestamp = Math.floor(new Date().getTime() / 1000);
  const { pageUrl, host } = getPageUrl(request);

  let title = "Arbitrum Delegate Frame";
  let description = "Check or set your Arbitrum Delegate.";
  let imageUrl = `${host}/static/img/delegate/arb/arb-start-1.png`;

  // buttons
  let button1 = { text: "Check My Delegate", action: "post", url: `${host}/frame/delegate/arb/delegate?t=${timestamp}` };

  reply.view("./templates/delegate/arb/start-1.liquid", {
    button1,
    description,
    imageUrl,
    pageUrl,
    title
  });

  // verify the user's signature via airstack API if signature is present
  if (request?.body?.untrustedData && request?.body?.trustedData) {
    validateFramesMessage(request.body.untrustedData, request.body.trustedData)
  }
}

export async function arbDelegateDelegate(request, reply) {
  console.log("start arbDelegateDelegate frame");

  // verify the user's signature via airstack API if signature is present
  if (request?.body?.untrustedData && request?.body?.trustedData) {
    validateFramesMessage(request.body.untrustedData, request.body.trustedData)
  }

  const timestamp = Math.floor(new Date().getTime() / 1000);
  const { pageUrl, host } = getPageUrl(request);

  let title;
  let description;
  let imageUrl;
  let button1;

  console.log("get address...")

  let userAddress = getAddress(request.query.addr);
  let userFarcaster;
  let userEns;
  let userAvatar;
  let userName;

  console.log("userAddress: ", userAddress);

  if (!userAddress) {
    const fid = request?.body?.untrustedData?.fid || request.query.fid;

    console.log("get address from fid: ", fid);

    if (fid) {
      const fidQuery = await getSocialsFromFid(fid);

      console.log("fidQuery: ", fidQuery);

      if (fidQuery.success) {
        userAddress = getAddress(fidQuery?.userAddress);
        userFarcaster = fidQuery?.farcaster;
        userEns = fidQuery?.ens;
        userAvatar = fidQuery?.avatar;

        if (userEns) {
          userName = userEns;
        } else if (userFarcaster) {
          userName = userFarcaster;
        } else {
          userName = userAddress.slice(0, 6) + "..." + userAddress.slice(-4);
        }
      }
    }
  }

  if (!userAddress) {
    title = "Invalid or missing address";
    description = "Please provide a valid address to check its delegate.";
    imageUrl = `${host}/static/img/delegate/arb/arb-delegate-error.png`;
    button1 = { text: "Back to start", action: "post", url: `${host}/frame/delegate/arb/start-1` };

    return reply.view("./templates/delegate/arb/error-delegate.liquid", {
      button1,
      description,
      imageUrl,
      pageUrl,
      title
    });
  }

  const provider = getProvider(chainId);

  console.log("get balance...")

  const balance = await getArbBalance(userAddress, provider, 4);

  console.log("balance: ", balance);

  const delegateQuery = await getArbitrumDelegate(userAddress, provider);

  console.log("delegateQuery: ", delegateQuery);

  const delegateAddress = delegateQuery?.delegate;
  let delegateName;

  // if no delegate, show a different frame
  if (!delegateAddress) {
    title = "No Arbitrum Delegate";
    description = "You don't have an Arbitrum delegate yet.";
    imageUrl = `${host}/image/arb/no-delegate?t=${timestamp}&user=${userName}&balance=${balance}`;
    button1 = { text: "Submit", action: "post", url: `${host}/frame/delegate/arb/confirm?t=${timestamp}` };

    return reply.view("./templates/delegate/arb/delegate2.liquid", {
      button1,
      description,
      imageUrl,
      pageUrl,
      title
    });
  }

  let delegateFarcaster;

  if (String(delegateAddress).toLowerCase() === String(userAddress).toLowerCase()) {
    delegateName = userName;
    delegateFarcaster = userFarcaster;
  } else {
    const delegateNames = await getSocialsFromAddress(delegateAddress);
    delegateFarcaster = delegateNames?.farcaster;

    console.log("delegateNames from ENS data API: ", delegateNames);

    if (delegateNames?.ens) {
      delegateName = delegateNames?.ens;
    } else if (delegateNames?.farcaster) {
      delegateName = delegateNames?.farcaster;
    } else {
      delegateName = delegateAddress.slice(0, 6) + "..." + delegateAddress.slice(-4);
    }
  }

  title = "My Arbitrum Delegate";
  description = "Check who's my Arbitrum delegate and my ARB balance.";
  imageUrl = `${host}/image/arb/delegate?t=${timestamp}&user=${userName}&balance=${balance}&delegate=${delegateName}`;

  // TODO: share link (warpcastShareUrl), add frame url at the end
  let warpcastShareUrl = `https://warpcast.com/~/compose?text=My+Arbitrum+delegate+is+${delegateName}.+Check+yours+via+this+frame+made+by+%40tempetechie.eth+%26+%40tekr0x.eth+&embeds[]=${host}%2Fframe%2Fdelegate%2Farb%2Fshare%3Ft%3D${timestamp}%26user%3D${userName}%26balance%3D${balance}%26delegate%3D${delegateName}`;

  if (delegateFarcaster) {
    warpcastShareUrl = `https://warpcast.com/~/compose?text=My+Arbitrum+delegate+is+%40${delegateName}.+Check+yours+via+this+frame+made+by+%40tempetechie.eth+%26+%40tekr0x.eth+&embeds[]=${host}%2Fframe%2Fdelegate%2Farb%2Fshare%3Ft%3D${timestamp}%26user%3D${userName}%26balance%3D${balance}%26delegate%3D${delegateName}`;
  }

  // buttons
  button1 = { text: "Submit", action: "post", url: `${host}/frame/delegate/arb/confirm?t=${timestamp}` };
  let button2 = { text: "Share", action: "link", url: warpcastShareUrl }; // TODO: add share link

  return reply.view("./templates/delegate/arb/delegate.liquid", {
    button1,
    button2,
    description,
    imageUrl,
    pageUrl,
    title
  });
}

export async function arbDelegateShare(request, reply) {
  const timestamp = Math.floor(new Date().getTime() / 1000);
  const { pageUrl, host } = getPageUrl(request);

  let user = request.query.user;
  let balance = request.query.balance;
  let delegate = request.query.delegate;

  if (!user) {
    reply.status(400).send('Missing user address or name');
    return;
  }

  if (!delegate) {
    reply.status(400).send('Missing delegate address or name');
    return;
  }

  if (!balance) {
    reply.status(400).send('Missing balance');
    return;
  }

  const title = "Share My Arbitrum Delegate";
  const description = "Share your Arbitrum Delegate frame with your friends.";
  const imageUrl = `${host}/image/arb/share?t=${timestamp}&user=${user}&balance=${balance}&delegate=${delegate}`;
  const button1 = { text: "Check My Delegate", action: "post", url: `${host}/frame/delegate/arb/delegate?t=${timestamp}` };

  return reply.view("./templates/delegate/arb/share.liquid", {
    button1,
    description,
    imageUrl,
    pageUrl,
    title
  });
}