const crypto = require('crypto');

const encrypt = (text) => {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from('', 'hex');  // Ensure key is 32 bytes
  const iv = Buffer.from('', 'hex');  // Ensure IV is 16 bytes

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

module.exports = { encrypt };
