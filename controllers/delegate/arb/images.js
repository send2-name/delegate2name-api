import { ethers } from 'ethers';
import { createCanvas, loadImage } from 'canvas';
import delegateFrameSvg from '../../../utils/delegate/arb/delegateFrameSvg.js';
import noDelegateFrameSvg from '../../../utils/delegate/arb/noDelegateFrameSvg.js';
import shareFrameSvg from '../../../utils/delegate/arb/shareFrameSvg.js';

export async function delegateArbDelegate(request, reply) {
  const timestamp = Math.floor(new Date().getTime() / 1000);
  let user = request.query.user;
  let delegate = request.query.delegate;
  let balance = request.query.balance;

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

export async function delegateArbNoDelegate(request, reply) {
  const timestamp = Math.floor(new Date().getTime() / 1000);
  let user = request.query.user;
  let balance = request.query.balance;

  if (!user) {
    reply.status(400).send('Missing user address or name');
    return;
  }

  if (!balance) {
    reply.status(400).send('Missing balance');
    return;
  }

  // if no ENS name for user, use short address
  if (ethers.utils.isAddress(user)) {
    user = user.slice(0, 6) + "..." + user.slice(-4);
  }

  const svgImage = noDelegateFrameSvg(user, balance);

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
      .header('Content-Disposition', `inline; filename="delegate2-${user}-${timestamp}.png"`)
      .send(buffer);
  } catch (error) {
    console.error(error);
    reply.status(500).send('Failed to generate image');
  }
}

export async function delegateArbShare(request, reply) {
  const timestamp = Math.floor(new Date().getTime() / 1000);
  let user = request.query.user;
  let delegate = request.query.delegate;
  let balance = request.query.balance;

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

  // if no ENS name for user, use short address
  if (ethers.utils.isAddress(user)) {
    user = user.slice(0, 6) + "..." + user.slice(-4);
  }

  // if no ENS name for delegate, use short address
  if (ethers.utils.isAddress(delegate)) {
    delegate = delegate.slice(0, 6) + "..." + delegate.slice(-4);
  }

  const svgImage = shareFrameSvg(user, balance, delegate);

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
      .header('Content-Disposition', `inline; filename="share-${user}-${timestamp}.png"`)
      .send(buffer);
  } catch (error) {
    console.error(error);
    reply.status(500).send('Failed to generate image');
  }
}