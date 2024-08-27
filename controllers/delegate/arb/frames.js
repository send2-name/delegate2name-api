import { getAddress } from "../../../utils/sanitize.js";
import { getPageUrl } from "../../../utils/request.js";
import { validateFramesMessage } from "../../../utils/validate.js";

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

export function arbDelegateDelegate(request, reply) {
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

  console.log(`User address 1: ${userAddress}`);

  if (!userAddress) {
    userAddress = getAddress(request?.body?.untrustedData?.address);
    console.log(`User address 2: ${userAddress}`);
  }

  if (!userAddress) {
    console.log(`Untrusted data: ${request?.body?.untrustedData}`);
    title = "Invalid or missing address";
    description = "Please provide a valid address to check its delegate.";
    imageUrl = `${host}/static/img/delegate/arb/arb-delegate-no-address.png`;
    button1 = { text: "Back to start", action: "post", url: `${host}/frame/delegate/arb/start-1` };

    return reply.view("./templates/delegate/arb/error-delegate-no-address.liquid", {
      button1,
      description,
      imageUrl,
      pageUrl,
      title
    });
  }

  title = "My Arbitrum Delegate";
  description = "Check who's my Arbitrum delegate and my ARB balance.";
  imageUrl = `${host}/image/arb/delegate?t=${timestamp}&addr=${userAddress}`;

  // buttons
  button1 = { text: "Submit", action: "post", url: `${host}/frame/delegate/arb/confirm?t=${timestamp}` };
  let button2 = { text: "Share", action: "link", url: `${host}/TODO` }; // TODO: add share link

  reply.view("./templates/delegate/arb/delegate.liquid", {
    button1,
    button2,
    description,
    imageUrl,
    pageUrl,
    title
  });
}

