import { ethers } from "ethers";
import { getSocialsFromAddress, getSocialsFromEns, getSocialsFromFarcaster, getSocialsFromFid } from "../../../utils/airstack.js";
import { getPageUrl } from "../../../utils/request.js";
import { getTokenBalance } from '../../../utils/balance.js';
import { getOpAddress, getOptimismDelegate } from '../../../utils/dao.js';
import { getProvider } from '../../../utils/network.js';
import { getAddress } from "../../../utils/sanitize.js";
import { validateFramesMessage } from "../../../utils/validate.js";

const chainId = 10;

export async function opDelegateDelegate(request, reply) {
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
          imageUrl = `${host}/static/img/delegate/op/delegate-no-address.png`;
          button1 = { text: "Back to start", action: "post", url: `${host}/frame/delegate/op/start-1` };
      
          return reply.view("./templates/delegate/op/error-delegate.liquid", {
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
          userName = `@${String(userFarcaster).replace("@", "")}`;
        } else if (userEns) {
          userName = userEns;
        } else {
          userName = null;
        }
      } else {
        title = "Error fetching user data";
        description = fidQuery?.message || "Error fetching user data";
        imageUrl = `${host}/static/img/delegate/op/delegate-error.png`;
        button1 = { text: "Back to start", action: "post", url: `${host}/frame/delegate/op/start-1` };
    
        return reply.view("./templates/delegate/op/error-delegate.liquid", {
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
    imageUrl = `${host}/static/img/delegate/op/delegate-error.png`;
    button1 = { text: "Back to start", action: "post", url: `${host}/frame/delegate/op/start-1` };

    return reply.view("./templates/delegate/op/error-delegate.liquid", {
      button1,
      description,
      imageUrl,
      pageUrl,
      title
    });
  }

  const provider = getProvider(chainId);

  const opAddress = getOpAddress();
  const balance = await getTokenBalance(userAddress, opAddress, provider, 18, 4);

  const delegateQuery = await getOptimismDelegate(userAddress, provider);

  const delegateAddress = delegateQuery?.delegate;
  let delegateName;
  let delegateShortAddress;

  // if no delegate, show a different frame
  if (!delegateAddress && delegateQuery?.success) {
    title = "No Optimism Delegate";
    description = "You don't have an Optimism delegate yet.";
    imageUrl = `${host}/image/op/no-delegate?t=${timestamp}&user=${userName}&balance=${balance}&ushort=${userShortAddress}`;
    button1 = { text: "Submit", action: "post", url: `${host}/frame/delegate/op/confirm?t=${timestamp}` };

    return reply.view("./templates/delegate/op/delegate2.liquid", {
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
      delegateName = `@${String(delegateNames?.farcaster).replace("@", "")}`;
    } else if (delegateNames?.ens) {
      delegateName = delegateNames?.ens;
    } else {
      delegateName = null;
    }
  }

  title = "My Optimism Delegate";
  description = "Check who's my Optimism delegate and my OP balance.";
  imageUrl = `${host}/image/op/delegate?t=${timestamp}&user=${userName}&balance=${balance}&delegate=${delegateName}&ushort=${userShortAddress}&dshort=${delegateShortAddress}`;

  let delegateNameCast = delegateName;

  if (!delegateNameCast) {
    delegateNameCast = delegateShortAddress;
  }

  let warpcastShareUrl = `https://warpcast.com/~/compose?text=My+Optimism+delegate+is+${delegateNameCast}.+Check+yours+via+this+frame+made+by+%40tempetechie.eth+%26+%40tekr0x.eth+&embeds[]=${host}%2Fframe%2Fdelegate%2Fop%2Fshare%3Ft%3D${timestamp}%26user%3D${userName}%26ushort%3D${userShortAddress}%26balance%3D${balance}%26delegate%3D${delegateName}%26dshort%3D${delegateShortAddress}`;

  // buttons
  button1 = { text: "Submit", action: "post", url: `${host}/frame/delegate/op/confirm?t=${timestamp}&current-delegate-address=${delegateAddress}` };
  let button2 = { text: "Share", action: "link", url: warpcastShareUrl };

  return reply.view("./templates/delegate/op/delegate.liquid", {
    button1,
    button2,
    description,
    imageUrl,
    pageUrl,
    title
  });
}

export async function opDelegateConfirm(request, reply) {
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
    imageUrl = `${host}/static/img/delegate/op/delegate-error.png`;
    button1 = { text: "Back to start", action: "post", url: `${host}/frame/delegate/op/start-1` };

    return reply.view("./templates/delegate/op/error-delegate.liquid", {
      button1,
      description,
      imageUrl,
      pageUrl,
      title
    });
  }

  // trim newDelegate, no leading or trailing spaces allowed
  newDelegate = String(newDelegate).trim();

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
    //console.log(socials);

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
    imageUrl = `${host}/static/img/delegate/op/delegate-not-found.png`;
    button1 = { text: "Back to start", action: "post", url: `${host}/frame/delegate/op/start-1` };

    return reply.view("./templates/delegate/op/error-delegate.liquid", {
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
    imageUrl = `${host}/static/img/delegate/op/delegate-already-set.png`;
    button1 = { text: "Back to start", action: "post", url: `${host}/frame/delegate/op/start-1` };

    return reply.view("./templates/delegate/op/error-delegate.liquid", {
      button1,
      description,
      imageUrl,
      pageUrl,
      title
    });
  }

  // if delegate is set and is different from the current delegate, proceed to the confirmation frame
  if (delegateFarcaster) {
    delegateFarcaster = String(delegateFarcaster).replace("@", "");
  }

  let delegateName = delegateFarcaster || delegateEns || delegateShortAddress;

  if (delegateName === delegateFarcaster) {
    delegateName = `@${delegateName}`;
  }

  button1 = { 
    text: "Confirm", action: "tx", 
    target: `${host}/frame/delegate/op/tx-data?delegate=${delegateAddress}`, 
    url: `${host}/frame/delegate/op/tx-callback?delegate=${delegateAddress}&dname=${delegateName}` 
  };
  
  const button2 = { text: "Back", action: "post", url: `${host}/frame/delegate/op/start-1` };
  
  const warpcastShareUrl = `https://warpcast.com/~/compose?text=Consider+setting+${delegateName}+as+your+Optimism+delegate.+Share+this+frame+with+your+friends.+Frame+made+by+%40tempetechie.eth+%26+%40tekr0x.eth+&embeds[]=${host}%2Fframe%2Fdelegate%2Fop%2Fconfirm%3Ft%3D${timestamp}%26delegate%3D${delegateAddress}`;
  const button3 = { text: "Share", action: "link", url: warpcastShareUrl };

  title = `Set ${delegateName} as your Optimism Delegate`;
  description = `Consider setting ${delegateName} as your Optimism delegate. Share this frame with your friends.`;
  imageUrl = `${host}/image/op/confirm?t=${timestamp}&ens=${delegateEns}&fc=${delegateFarcaster}&short=${delegateShortAddress}`;

  return reply.view("./templates/delegate/op/confirm.liquid", {
    button1,
    button2,
    button3,
    description,
    imageUrl,
    pageUrl,
    title
  });
}

export function opDelegateStart1(request, reply) {
  const timestamp = Math.floor(new Date().getTime() / 1000);
  const { pageUrl, host } = getPageUrl(request);

  let title = "Optimism Delegate Frame";
  let description = "Check or set your Optimism Delegate.";
  let imageUrl = `${host}/static/img/delegate/op/start-1.png`;

  // buttons
  let button1 = { text: "Check My Delegate", action: "post", url: `${host}/frame/delegate/op/delegate?t=${timestamp}` };

  reply.view("./templates/delegate/op/start-1.liquid", {
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

export async function opDelegateTxCallback(request, reply) {
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
  const blockExplorerUrl = "https://optimistic.etherscan.io/tx/" + txHash;

  const txReceipt = await provider.getTransactionReceipt(txHash);
  let title;
  let description;
  let button1;
  let imageUrl;

  if (!txReceipt) {
    // tx is still pending
    button1 = { text: "Check Again", action: "post", url: `${host}/frame/delegate/op/tx-callback?delegate=${delegateAddress}&dname=${delegateName}&tx=${txHash}` };
    title = "Transaction Pending";
    description = "Your transaction is being processed. Please check again later.";
    imageUrl = `${host}/static/img/delegate/op/callback-wait.gif`;

    return reply.view("./templates/delegate/op/pending.liquid", {
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
      imageUrl = `${host}/image/op/success?t=${timestamp}&delegate=${delegateName}`;
      title = "Transaction Successful";
      description = "Your Optimism delegate has been set successfully.";

      const warpcastShareUrl = `https://warpcast.com/~/compose?text=I+have+set+${delegateName}+as+my+Optimism+delegate.+Consider+${delegateName}+as+your+delegate+too%2C+via+this+frame+made+by+%40tempetechie.eth+%26+%40tekr0x.eth+&embeds[]=${host}%2Fframe%2Fdelegate%2Fop%2Fconfirm%3Ft%3D${timestamp}%26delegate%3D${String(delegateName).replace("@", "")}`;
      const button2 = { text: "Share", action: "link", url: warpcastShareUrl };
      const button3 = { text: "Back to start", action: "post", url: `${host}/frame/delegate/op/start-1` };

      return reply.view("./templates/delegate/op/success.liquid", {
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
      imageUrl = `${host}/static/img/delegate/op/delegate-fail.png`;
      title = "Transaction Failed";
      description = "Your Optimism delegate transaction has failed.";

      const button2 = { text: "Back to start", action: "post", url: `${host}/frame/delegate/op/start-1` };

      return reply.view("./templates/delegate/op/fail.liquid", {
        button1,
        button2,
        description,
        imageUrl,
        pageUrl,
        title
      });
    } else {
      // unknown tx status
      imageUrl = `${host}/static/img/delegate/op/delegate-unknown.png`;
      title = "Transaction Status Unknown";
      description = "Your Optimism delegate transaction status is unknown.";

      const button2 = { text: "Back to start", action: "post", url: `${host}/frame/delegate/op/start-1` };

      return reply.view("./templates/delegate/op/fail.liquid", {
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

export function opDelegateTxData(request, reply) {
  // verify the user's signature via airstack API if signature is present
  if (request?.body?.untrustedData && request?.body?.trustedData) {
    validateFramesMessage(request.body.untrustedData, request.body.trustedData)
  }

  const delegateAddress = getAddress(request.query.delegate);

  if (!delegateAddress) {
    reply.status(400).send('Missing delegate address');
    return;
  }

  const opAddress = getOpAddress();

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
      to: opAddress,
      data: txData,
      value: "0",
    },
  };

  return reply.send(tx);
}

export async function opMyDelegateShare(request, reply) {
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

  const title = "Share My Optimism Delegate";
  const description = "Share your Optimism Delegate frame with your friends.";
  const imageUrl = `${host}/image/op/share?t=${timestamp}&user=${user}&balance=${balance}&delegate=${delegate}&ushort=${userShortAddress}&dshort=${delegateShortAddress}`;
  const button1 = { text: "Check My Delegate", action: "post", url: `${host}/frame/delegate/op/delegate?t=${timestamp}` };

  return reply.view("./templates/delegate/op/share.liquid", {
    button1,
    description,
    imageUrl,
    pageUrl,
    title
  });
}
