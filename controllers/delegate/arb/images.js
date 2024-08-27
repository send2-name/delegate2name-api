import { ethers } from 'ethers';
import { createCanvas, loadImage } from 'canvas';
import delegateFrameSvg from '../../../utils/delegate/arb/delegateFrameSvg.js';
import { getArbBalance } from '../../../utils/balance.js';
import { getArbitrumDelegate } from '../../../utils/dao.js';
import { getNames } from '../../../utils/names.js';
import { getProvider } from '../../../utils/network.js';
import { getAddress } from '../../../utils/sanitize.js';

const chainId = 42161;

export async function delegateArbDelegate(request, reply) {
  const timestamp = Math.floor(new Date().getTime() / 1000);
  let user = getAddress(request.query.addr);
  const provider = getProvider(chainId);

  if (!user) {
    reply.status(400).send('Invalid or no address');
    return;
  }

  const balance = await getArbBalance(user, provider, 4);
  const delegateQuery = await getArbitrumDelegate(user, provider);
  let delegate = delegateQuery.delegate;

  // fetch ENS names for user and delegate
  const userNames = await getNames(user, provider);

  if (userNames.ens) {
    user = userNames.ens;
  }

  const delegateNames = await getNames(delegate, provider);

  if (delegateNames.ens) {
    delegate = delegateNames.ens;
  }

  // if no ENS name for user, use short address
  if (ethers.utils.isAddress(user)) {
    user = user.slice(0, 6) + "..." + user.slice(-4);
  }

  // if no ENS name for delegate, use short address
  if (ethers.utils.isAddress(delegate)) {
    delegate = delegate.slice(0, 6) + "..." + delegate.slice(-4);
  }

  const svgImage = delegateFrameSvg(user, balance, delegate);

  try {
    const width = 1910; // Canvas width
    const height = 1000; // Canvas height

    // Create a canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Load the SVG into the canvas
    const img = await loadImage(`data:image/svg+xml;base64,${Buffer.from(svgImage).toString('base64')}`);
    ctx.drawImage(img, 0, 0);

    // Convert the canvas to a PNG buffer
    const buffer = canvas.toBuffer('image/png');

    // Set the response headers and send the image
    reply
      .type('image/png')
      .header('Content-Disposition', `inline; filename="delegate-${user}-${timestamp}.png"`)
      .send(buffer);
  } catch (error) {
    console.error(error);
    reply.status(500).send('Failed to generate image');
  }
}