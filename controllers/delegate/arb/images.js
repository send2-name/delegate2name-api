import { ethers } from 'ethers';
import { createCanvas, loadImage } from 'canvas';
import confirmFrameSvg from '../../../utils/delegate/arb/confirmFrameSvg.js';
import delegateFrameSvg from '../../../utils/delegate/arb/delegateFrameSvg.js';
import noDelegateFrameSvg from '../../../utils/delegate/arb/noDelegateFrameSvg.js';
import shareMyDelegateFrameSvg from '../../../utils/delegate/arb/shareMyDelegateFrameSvg.js';
import successFrameSvg from '../../../utils/delegate/arb/successFrameSvg.js';

export async function delegateArbConfirm(request, reply) {
  const timestamp = Math.floor(new Date().getTime() / 1000);
  let delegateEns = request.query.ens || request.query.ensname;
  let delegateFarcaster = request.query.fc;
  let delegateShortAddress = request.query.short;
  let delegateName = delegateEns;

  if (delegateEns == "undefined" || delegateEns == "null" || !delegateEns) {
    delegateEns = "/";
    delegateName = delegateFarcaster;
  }

  if (delegateFarcaster == "undefined" || delegateFarcaster == "null" || !delegateFarcaster) {
    delegateFarcaster = "/";
    delegateName = delegateShortAddress;
  }

  const svgImage = confirmFrameSvg(delegateShortAddress, delegateEns, delegateFarcaster);

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
      .header('Content-Disposition', `inline; filename="delegate-${String(delegateName).replace(".", "")}-${timestamp}.png"`)
      .send(buffer);
  } catch (error) {
    console.error(error);
    reply.status(500).send('Failed to generate image');
  }
}

export async function delegateArbDelegate(request, reply) {
  const timestamp = Math.floor(new Date().getTime() / 1000);
  let user = request.query.user;
  let delegate = request.query.delegate;
  let balance = request.query.balance;
  let userShortAddress = request.query.ushort;
  let delegateShortAddress = request.query.dshort;

  if (!user) {
    reply.status(400).send('Missing user address or name');
    return;
  }

  if (delegate == "undefined" || delegate == "null") {
    delegate = "";
  }

  // if no ENS name for user, use short address
  if (ethers.utils.isAddress(user)) {
    user = user.slice(0, 6) + "..." + user.slice(-4);
  }

  const svgImage = delegateFrameSvg(user, balance, delegate, userShortAddress, delegateShortAddress);

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
  let userShortAddress = request.query.ushort;

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

  const svgImage = noDelegateFrameSvg(user, balance, userShortAddress);

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
      .header('Content-Disposition', `inline; filename="delegate2-${String(user).replace("@", "")}-${timestamp}.png"`)
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
  let userShortAddress = request.query.ushort;
  let delegateShortAddress = request.query.dshort;

  if (!user) {
    reply.status(400).send('Missing user address or name');
    return;
  }

  if (delegate == "undefined" || delegate == "null") {
    delegate = "";
  }

  // if no ENS name for user, use short address
  if (ethers.utils.isAddress(user)) {
    user = user.slice(0, 6) + "..." + user.slice(-4);
  }

  const svgImage = shareMyDelegateFrameSvg(user, balance, delegate, userShortAddress, delegateShortAddress);

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

export async function delegateArbSuccess(request, reply) {
  const timestamp = Math.floor(new Date().getTime() / 1000);
  let delegateName = request.query.delegate;

  if (!delegateName) {
    reply.status(400).send('Missing delegate address or name');
    return;
  }

  const svgImage = successFrameSvg(delegateName);

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
      .header('Content-Disposition', `inline; filename="share-${String(delegateName).replace(".", "")}-${timestamp}.png"`)
      .send(buffer);
  } catch (error) {
    console.error(error);
    reply.status(500).send('Failed to generate image');
  }
}