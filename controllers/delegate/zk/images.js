import { ethers } from 'ethers';
import { createCanvas, loadImage } from 'canvas';
import confirmFrameSvg from '../../../utils/delegate/zk/confirmFrameSvg.js';
import delegateFrameSvg from '../../../utils/delegate/zk/delegateFrameSvg.js';
import noDelegateFrameSvg from '../../../utils/delegate/zk/noDelegateFrameSvg.js';
import shareMyDelegateFrameSvg from '../../../utils/delegate/zk/shareMyDelegateFrameSvg.js';
import successFrameSvg from '../../../utils/delegate/zk/successFrameSvg.js';

export async function delegateZkConfirm(request, reply) {
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
    const width = 1910;
    const height = 1000;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const img = await loadImage(`data:image/svg+xml;base64,${Buffer.from(svgImage).toString('base64')}`);
    ctx.drawImage(img, 0, 0);

    const buffer = canvas.toBuffer('image/png');

    reply
      .type('image/png')
      .header('Content-Disposition', `inline; filename="delegate-${String(delegateName).replace(".", "")}-${timestamp}.png"`)
      .send(buffer);
  } catch (error) {
    console.error(error);
    reply.status(500).send('Failed to generate image');
  }
}

export async function delegateZkDelegate(request, reply) {
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

  if (ethers.utils.isAddress(user)) {
    user = user.slice(0, 6) + "..." + user.slice(-4);
  }

  const svgImage = delegateFrameSvg(user, balance, delegate, userShortAddress, delegateShortAddress);

  try {
    const width = 1910;
    const height = 1000;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const img = await loadImage(`data:image/svg+xml;base64,${Buffer.from(svgImage).toString('base64')}`);
    ctx.drawImage(img, 0, 0);

    const buffer = canvas.toBuffer('image/png');

    reply
      .type('image/png')
      .header('Content-Disposition', `inline; filename="delegate-${user}-${timestamp}.png"`)
      .send(buffer);
  } catch (error) {
    console.error(error);
    reply.status(500).send('Failed to generate image');
  }
}

export async function delegateZkNoDelegate(request, reply) {
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

  if (ethers.utils.isAddress(user)) {
    user = user.slice(0, 6) + "..." + user.slice(-4);
  }

  const svgImage = noDelegateFrameSvg(user, balance, userShortAddress);

  try {
    const width = 1910;
    const height = 1000;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const img = await loadImage(`data:image/svg+xml;base64,${Buffer.from(svgImage).toString('base64')}`);
    ctx.drawImage(img, 0, 0);

    const buffer = canvas.toBuffer('image/png');

    reply
      .type('image/png')
      .header('Content-Disposition', `inline; filename="delegate2-${String(user).replace("@", "")}-${timestamp}.png"`)
      .send(buffer);
  } catch (error) {
    console.error(error);
    reply.status(500).send('Failed to generate image');
  }
}

export async function delegateZkShare(request, reply) {
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

  if (ethers.utils.isAddress(user)) {
    user = user.slice(0, 6) + "..." + user.slice(-4);
  }

  const svgImage = shareMyDelegateFrameSvg(user, balance, delegate, userShortAddress, delegateShortAddress);

  try {
    const width = 1910;
    const height = 1000;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const img = await loadImage(`data:image/svg+xml;base64,${Buffer.from(svgImage).toString('base64')}`);
    ctx.drawImage(img, 0, 0);

    const buffer = canvas.toBuffer('image/png');

    reply
      .type('image/png')
      .header('Content-Disposition', `inline; filename="share-${user}-${timestamp}.png"`)
      .send(buffer);
  } catch (error) {
    console.error(error);
    reply.status(500).send('Failed to generate image');
  }
}

export async function delegateZkSuccess(request, reply) {
  const timestamp = Math.floor(new Date().getTime() / 1000);
  let delegateName = request.query.delegate;

  if (!delegateName) {
    reply.status(400).send('Missing delegate address or name');
    return;
  }

  const svgImage = successFrameSvg(delegateName);

  try {
    const width = 1910;
    const height = 1000;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const img = await loadImage(`data:image/svg+xml;base64,${Buffer.from(svgImage).toString('base64')}`);
    ctx.drawImage(img, 0, 0);

    const buffer = canvas.toBuffer('image/png');

    reply
      .type('image/png')
      .header('Content-Disposition', `inline; filename="share-${String(delegateName).replace(".", "")}-${timestamp}.png"`)
      .send(buffer);
  } catch (error) {
    console.error(error);
    reply.status(500).send('Failed to generate image');
  }
}