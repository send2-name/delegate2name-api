import { getSocialsFromAddress, getSocialsFromEns, getSocialsFromFarcaster, getSocialsFromFid } from "../../../utils/airstack.js";
import { getPageUrl } from "../../../utils/request.js";
import { getArbBalance } from '../../../utils/balance.js';
import { getArbAddress, getArbitrumDelegate } from '../../../utils/dao.js';
import { getProvider } from '../../../utils/network.js';
import { getAddress } from "../../../utils/sanitize.js";
import { validateFramesMessage } from "../../../utils/validate.js";

const chainId = 42161;

export async function arbDelegateDelegate(request, reply) {
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

  let userAddress = getAddress(request.query.addr);
  let userShortAddress;
  let userFarcaster;
  let userEns;
  let userAvatar;
  let userName;

  if (!userAddress) {
    const fid = request?.body?.untrustedData?.fid || request.query.fid;

    if (fid) {
      const fidQuery = await getSocialsFromFid(fid);

      if (fidQuery.success) {
        if (!fidQuery?.userAddress) {
          title = "Invalid or missing address";
          description = "Please provide a valid address to check its delegate.";
          imageUrl = `${host}/static/img/delegate/arb/arb-delegate-no-address.png`;
          button1 = { text: "Back to start", action: "post", url: `${host}/frame/delegate/arb/start-1` };
      
          return reply.view("./templates/delegate/arb/error-delegate.liquid", {
            button1,
            description,
            imageUrl,
            pageUrl,
            title
          });
        }

        userAddress = getAddress(fidQuery?.userAddress);
        userShortAddress = userAddress.slice(0, 6) + "..." + userAddress.slice(-4);
        userFarcaster = fidQuery?.farcaster;
        userEns = fidQuery?.ens;
        userAvatar = fidQuery?.avatar;

        if (userFarcaster) {
          userName = `@${userFarcaster}`;
        } else if (userEns) {
          userName = userEns;
        } else {
          userName = null;
        }
      } else {
        title = "Error fetching user data";
        description = fidQuery?.message || "Error fetching user data";
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

  const balance = await getArbBalance(userAddress, provider, 4);

  const delegateQuery = await getArbitrumDelegate(userAddress, provider);

  const delegateAddress = delegateQuery?.delegate;
  let delegateName;
  let delegateShortAddress;

  // if no delegate, show a different frame
  if (!delegateAddress && delegateQuery?.success) {
    title = "No Arbitrum Delegate";
    description = "You don't have an Arbitrum delegate yet.";
    imageUrl = `${host}/image/arb/no-delegate?t=${timestamp}&user=${userName}&balance=${balance}&ushort=${userShortAddress}`;
    button1 = { text: "Submit", action: "post", url: `${host}/frame/delegate/arb/confirm?t=${timestamp}` };

    return reply.view("./templates/delegate/arb/delegate2.liquid", {
      button1,
      description,
      imageUrl,
      pageUrl,
      title
    });
  } else if (!delegateAddress && !delegateQuery?.success) {
    delegateFarcaster = null;
    delegateName = "Error fetching delegate";
  }

  let delegateFarcaster;

  if (String(delegateAddress).toLowerCase() === String(userAddress).toLowerCase()) {
    delegateName = userName;
    delegateFarcaster = userFarcaster;
    delegateShortAddress = userShortAddress;
  } else {
    delegateShortAddress = delegateAddress.slice(0, 6) + "..." + delegateAddress.slice(-4);
    const delegateNames = await getSocialsFromAddress(delegateAddress);
    delegateFarcaster = delegateNames?.farcaster;

    if (delegateNames?.farcaster) {
      delegateName = `@$${delegateNames?.farcaster}`;
    } else if (delegateNames?.ens) {
      delegateName = delegateNames?.ens;
    } else {
      delegateName = null;
    }
  }

  title = "My Arbitrum Delegate";
  description = "Check who's my Arbitrum delegate and my ARB balance.";
  imageUrl = `${host}/image/arb/delegate?t=${timestamp}&user=${userName}&balance=${balance}&delegate=${delegateName}&ushort=${userShortAddress}&dshort=${delegateShortAddress}`;

  let delegateNameCast = delegateName;

  if (!delegateNameCast) {
    delegateNameCast = delegateShortAddress;
  }

  let warpcastShareUrl = `https://warpcast.com/~/compose?text=My+Arbitrum+delegate+is+${delegateNameCast}.+Check+yours+via+this+frame+made+by+%40tempetechie.eth+%26+%40tekr0x.eth+&embeds[]=${host}%2Fframe%2Fdelegate%2Farb%2Fshare%3Ft%3D${timestamp}%26user%3D${userName}%26ushort%3D${userShortAddress}%26balance%3D${balance}%26delegate%3D${delegateName}%26dshort%3D${delegateShortAddress}`;

  if (delegateFarcaster) {
    warpcastShareUrl = `https://warpcast.com/~/compose?text=My+Arbitrum+delegate+is+%40${delegateNameCast}.+Check+yours+via+this+frame+made+by+%40tempetechie.eth+%26+%40tekr0x.eth+&embeds[]=${host}%2Fframe%2Fdelegate%2Farb%2Fshare%3Ft%3D${timestamp}%26user%3D${userName}%26ushort%3D${userShortAddress}%26balance%3D${balance}%26delegate%3D${delegateName}%26dshort%3D${delegateShortAddress}`;
  }

  // buttons
  button1 = { text: "Submit", action: "post", url: `${host}/frame/delegate/arb/confirm?t=${timestamp}&current-delegate-address=${delegateAddress}` };
  let button2 = { text: "Share", action: "link", url: warpcastShareUrl };

  return reply.view("./templates/delegate/arb/delegate.liquid", {
    button1,
    button2,
    description,
    imageUrl,
    pageUrl,
    title
  });
}

export async function arbDelegateConfirm(request, reply) {
  // verify the user's signature via airstack API if signature is present
  if (request?.body?.untrustedData && request?.body?.trustedData) {
    validateFramesMessage(request.body.untrustedData, request.body.trustedData)
  }

  const timestamp = Math.floor(new Date().getTime() / 1000);
  const { pageUrl, host } = getPageUrl(request);

  const currentDelegateAddress = getAddress(request.query['current-delegate-address']);

  let newDelegate = request.query?.delegate;

  if (!newDelegate) {
    newDelegate = request?.body?.untrustedData?.inputText;
  }

  let title;
  let description;
  let imageUrl;
  let button1;

  // if delegate address or name is missing, show an error frame
  if (!newDelegate) {
    title = "Invalid or missing delegate";
    description = "Please enter a delegate address or FC/ENS name.";
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

  // delegate data
  let socials;
  let delegateAddress;
  let delegateShortAddress;
  let delegateEns;
  let delegateFarcaster;

  // get socials
  if (getAddress(newDelegate)) {
    // if newDelegate is an address, call getSocialsFromAddress
    socials = await getSocialsFromAddress(newDelegate);
    delegateAddress = getAddress(newDelegate);
    delegateShortAddress = delegateAddress.slice(0, 6) + "..." + delegateAddress.slice(-4);
    delegateEns = socials?.ens;
    delegateFarcaster = socials?.farcaster;
  } else if (newDelegate.endsWith(".eth")) {
    // if newDelegate is an ENS name, call getSocialsFromEns
    socials = await getSocialsFromEns(newDelegate);
    delegateAddress = getAddress(socials?.userAddress);
    delegateShortAddress = delegateAddress.slice(0, 6) + "..." + delegateAddress.slice(-4);
    delegateEns = newDelegate;
    delegateFarcaster = socials?.farcaster;
  } else {
    // if newDelegate is an FC name, call getSocialsFromFarcaster
    socials = await getSocialsFromFarcaster(newDelegate);
    console.log(socials);

    if (socials?.userAddress) {
      delegateAddress = getAddress(socials?.userAddress);
      delegateShortAddress = delegateAddress.slice(0, 6) + "..." + delegateAddress.slice(-4);
      delegateEns = socials?.ens;
      delegateFarcaster = newDelegate;
    }
  }

  // if no delegateAddress, show the "delegate not found" frame
  if (!delegateAddress) {
    title = "Delegate not found";
    description = "Please provide a valid delegate address or FC/ENS name.";
    imageUrl = `${host}/static/img/delegate/arb/arb-delegate-not-found.png`;
    button1 = { text: "Back to start", action: "post", url: `${host}/frame/delegate/arb/start-1` };

    return reply.view("./templates/delegate/arb/error-delegate.liquid", {
      button1,
      description,
      imageUrl,
      pageUrl,
      title
    });
  }

  // if delegate address is the same as the current delegate, show the "same delegate" frame
  if (String(delegateAddress).toLowerCase() === String(currentDelegateAddress).toLowerCase()) {
    title = "Same Delegate";
    description = "You are already delegating to this address.";
    imageUrl = `${host}/static/img/delegate/arb/arb-delegate-already-set.png`;
    button1 = { text: "Back to start", action: "post", url: `${host}/frame/delegate/arb/start-1` };

    return reply.view("./templates/delegate/arb/error-delegate.liquid", {
      button1,
      description,
      imageUrl,
      pageUrl,
      title
    });
  }

  // if delegate is set and is different from the current delegate, proceed to the confirmation frame
  const delegateName = `@${delegateFarcaster}` || delegateEns || delegateShortAddress;

  button1 = { 
    text: "Confirm", action: "tx", 
    target: `${host}/frame/delegate/arb/tx-data?delegate=${delegateAddress}`, 
    url: `${host}/frame/delegate/arb/tx-callback?delegate=${delegateAddress}&dname=${delegateName}` 
  };
  
  const button2 = { text: "Back", action: "post", url: `${host}/frame/delegate/arb/start-1` };
  
  const warpcastShareUrl = `https://warpcast.com/~/compose?text=Consider+setting+${delegateName}+as+your+Arbitrum+delegate.+Share+this+frame+with+your+friends.+&embeds[]=${host}%2Fframe%2Fdelegate%2Farb%2Fconfirm%3Ft%3D${timestamp}%26delegate%3D${delegateAddress}`;
  const button3 = { text: "Share", action: "link", url: warpcastShareUrl };

  title = `Set ${delegateName} as your Arbitrum Delegate`;
  description = `Consider setting ${delegateName} as your Arbitrum delegate. Share this frame with your friends.`;
  imageUrl = `${host}/image/arb/confirm?t=${timestamp}&ens=${delegateEns}&fc=${delegateFarcaster}&short=${delegateShortAddress}`;

  return reply.view("./templates/delegate/arb/confirm.liquid", {
    button1,
    button2,
    button3,
    description,
    imageUrl,
    pageUrl,
    title
  });
}

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

export async function arbDelegateTxCallback(request, reply) {
  // verify the user's signature via airstack API if signature is present
  if (request?.body?.untrustedData && request?.body?.trustedData) {
    validateFramesMessage(request.body.untrustedData, request.body.trustedData)
  }

  const timestamp = Math.floor(new Date().getTime() / 1000);
  const { pageUrl, host } = getPageUrl(request);
  const delegateAddress = getAddress(request.query.delegate);
  const delegateName = request.query.dname;
  let txHash = request?.body?.untrustedData?.transactionId;

  if (!txHash) {
    txHash = request.query.tx;
  }

  const provider = getProvider(chainId);
  const blockExplorerUrl = "https://arbiscan.io/tx/" + txHash;

  const txReceipt = await provider.getTransactionReceipt(txHash);
  let title;
  let description;
  let button1;
  let imageUrl;

  if (!txReceipt) {
    // tx is still pending
    button1 = { text: "Check Again", action: "post", url: `${host}/frame/delegate/arb/tx-callback?delegate=${delegateAddress}&dname=${delegateName}&tx=${txHash}` };
    title = "Transaction Pending";
    description = "Your transaction is being processed. Please check again later.";
    imageUrl = `${host}/static/img/delegate/arb/arb-callback-wait.gif`;

    return reply.view("./templates/delegate/arb/pending.liquid", {
      button1,
      description,
      imageUrl,
      pageUrl,
      title
    });
  } else {
    button1 = { text: "Tx Info", action: "link", url: blockExplorerUrl };

    if (txReceipt?.status === 1) {
      // successful tx
      imageUrl = `${host}/image/arb/success?t=${timestamp}&delegate=${delegateName}`;
      title = "Transaction Successful";
      description = "Your Arbitrum delegate has been set successfully.";

      const warpcastShareUrl = `https://warpcast.com/~/compose?text=I+have+set+${delegateName}+as+my+Arbitrum+delegate.+Consider+${delegateName}+as+delegate+too%2C+via+this+frame+made+by+%40tempetechie.eth+%26+%40tekr0x.eth+&embeds[]=${host}%2Fframe%2Fdelegate%2Farb%2Fconfirm%3Ft%3D${timestamp}%26delegate%3D${delegateName}`;
      const button2 = { text: "Share", action: "link", url: warpcastShareUrl };
      const button3 = { text: "Back to start", action: "post", url: `${host}/frame/delegate/arb/start-1` };

      return reply.view("./templates/delegate/arb/success.liquid", {
        button1,
        button2,
        button3,
        description,
        imageUrl,
        pageUrl,
        title
      });
    } else if (txReceipt?.status === 0) {
      // failed tx
      imageUrl = `${host}/static/img/delegate/arb/arb-delegate-fail.png`;
      title = "Transaction Failed";
      description = "Your Arbitrum delegate transaction has failed.";

      const button2 = { text: "Back to start", action: "post", url: `${host}/frame/delegate/arb/start-1` };

      return reply.view("./templates/delegate/arb/fail.liquid", {
        button1,
        button2,
        description,
        imageUrl,
        pageUrl,
        title
      });
    } else {
      // unknown tx status
      imageUrl = `${host}/static/img/delegate/arb/arb-delegate-unknown.png`;
      title = "Transaction Status Unknown";
      description = "Your Arbitrum delegate transaction status is unknown.";

      const button2 = { text: "Back to start", action: "post", url: `${host}/frame/delegate/arb/start-1` };

      return reply.view("./templates/delegate/arb/fail.liquid", {
        button1,
        button2,
        description,
        imageUrl,
        pageUrl,
        title
      });
    }
  }

}

export function arbDelegateTxData(request, reply) {
  // verify the user's signature via airstack API if signature is present
  if (request?.body?.untrustedData && request?.body?.trustedData) {
    validateFramesMessage(request.body.untrustedData, request.body.trustedData)
  }

  const delegateAddress = getAddress(request.query.delegate);

  if (!delegateAddress) {
    reply.status(400).send('Missing delegate address');
    return;
  }

  const arbAddress = getArbAddress();

  const abi = [
    "function delegate(address delegatee) public",
  ];

  const intrfc = new ethers.utils.Interface(abi);

  const txData = intrfc.encodeFunctionData("delegate", [delegateAddress]);

  const tx = {
    method: "eth_sendTransaction",
    chainId: `eip155:${chainId}`,
    params: {
      abi: abi,
      to: arbAddress,
      data: txData,
      value: "0",
    },
  };

  return reply.send(tx);
}

export async function arbMyDelegateShare(request, reply) {
  // verify the user's signature via airstack API if signature is present
  if (request?.body?.untrustedData && request?.body?.trustedData) {
    validateFramesMessage(request.body.untrustedData, request.body.trustedData)
  }

  const timestamp = Math.floor(new Date().getTime() / 1000);
  const { pageUrl, host } = getPageUrl(request);

  let user = request.query.user;
  let balance = request.query.balance;
  let delegate = request.query.delegate;
  let userShortAddress = request.query.ushort;
  let delegateShortAddress = request.query.dshort;

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
  const imageUrl = `${host}/image/arb/share?t=${timestamp}&user=${user}&balance=${balance}&delegate=${delegate}&ushort=${userShortAddress}&dshort=${delegateShortAddress}`;
  const button1 = { text: "Check My Delegate", action: "post", url: `${host}/frame/delegate/arb/delegate?t=${timestamp}` };

  return reply.view("./templates/delegate/arb/share.liquid", {
    button1,
    description,
    imageUrl,
    pageUrl,
    title
  });
}
