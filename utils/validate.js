import axios from 'axios';
import { getEnvVar } from './datastore.js';

// Airstack Frames message validation adapted from 0xdownshift's code
// https://gist.github.com/0xdownshift/ef7febdc1c62b41cd4866aa7a6bc9e39
export async function validateFramesMessage(untrustedData, trustedData) {
  console.log('Validating frames message...');

  // get airstack api key
  let apiKey;
  if (!process.env.MYLOCALHOST) {
    apiKey = await getEnvVar("airstackApiKey");

    if (apiKey) {
      if (!trustedData || !trustedData.messageBytes || trustedData.messageBytes.trim() === '') {
        console.warn('Invalid or empty messageBytes received');

        return {
          isValid: false,
          message: 'Invalid or empty messageBytes',
        };
      }

      try {
        const messageBytes = hexStringToUint8Array(trustedData.messageBytes);

        const validateMessageResponse = await axios.post(
          "https://hubs.airstack.xyz/v1/validateMessage",
          messageBytes,
          {
            headers: {
              "Content-Type": "application/octet-stream",
              "x-airstack-hubs": apiKey,
            },
          },
          {timeout: 2500}
        );

        //console.log('Validate Message Response:', validateMessageResponse.data);

        const { valid, message } = validateMessageResponse.data;

        if (valid) {
          let formattedMessage;

          try {
            formattedMessage = typeof message === 'string' ? JSON.parse(message) : message;
          } catch (parseError) {
            console.error('Error parsing message:', parseError);
            console.log('Raw message:', message);
            throw new Error('Failed to parse message from API response');
          }

          if (formattedMessage.data?.frameActionBody?.castId?.hash && untrustedData.castId?.hash) {
            formattedMessage.data.frameActionBody.castId.hash = bytesFromBase64(
              untrustedData.castId.hash
            );
          }

          //console.log('Formatted Message:', formattedMessage);

          return {
            isValid: true,
            message: formattedMessage,
          };
        } else {
          return {
            isValid: false,
            message: 'Message validation failed',
          };
        }
      } catch (error) {
        console.error('Error validating frames message:', error);

        if (error.response) {
          console.error('API response status:', error.response.status);
          console.error('API response data:', error.response.data);
        }

        throw error;
      }
    }
  }
}

// Helper function to convert hex string to Uint8Array
function hexStringToUint8Array(hexString) {
  if (typeof hexString !== 'string' || hexString.trim() === '') {
    throw new Error('Invalid hex string provided');
  }

  const matches = hexString.match(/[\da-f]{2}/gi);

  if (!matches) {
    throw new Error('Invalid hex string format');
  }
  
  return new Uint8Array(matches.map(function (h) {
    return parseInt(h, 16);
  }));
}

// Helper function to convert base64 to bytes
function bytesFromBase64(base64) {
  return Buffer.from(base64, 'base64');
}