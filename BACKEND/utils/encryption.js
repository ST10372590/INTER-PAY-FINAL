require('dotenv').config();
const crypto = require('crypto'); //we are using this library for AES encryption. It 

const algorithm = 'aes-256-gcm'; // this is an encryption algorithm and is used for authentication.
//(siwalikm, 2020)

// making sure that the encryption key is 32 char 
// and converts the string into a binary buffer so that crypto can see it.
const getKey = () => {
  const key = process.env.ENCRYPTION_KEY ;
    if (!key) throw new Error('ENCRYPTION_KEY not set');
  
  // If key is a 64-character hex string, convert it to buffer
  if (key.length === 64 && /^[0-9a-f]{64}$/i.test(key)) {
    return Buffer.from(key, 'hex');
  }
  
  // Otherwise, hash it to get 32 bytes
  return crypto.createHash('sha256').update(String(key)).digest();
};

const testKey = getKey();
console.log('Encryption key length:', testKey.length, 'bytes'); // Should be 32

const encrypt = (text) => {
  try {
    if (!text) return null; //checks if there is data to encrypt
    
    const iv = crypto.randomBytes(12); //iv generates random letters and numbers and makes sure that they are different everytime. 
    //creates object and takes the algorithm, key and iv
    const cipher = crypto.createCipheriv(algorithm, getKey(), iv); 
    // combines everything and takes the original text and encrypts it.
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag(); // this ensures data intergity
    
    // and returns IV:authTag:encryptedData
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error.message);
    throw new Error('Failed to encrypt data');
  }
}; //(siwalikm, 2020)

//this method turns the encrypted data into the original data/ 
const decrypt = (encryptedText) => {
  try {
    if (!encryptedText) return null; //checks if the text is empty
    
    const parts = encryptedText.split(':'); // the string that was stored as iv:authTag:encryptedData is seperated into an array
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    //converts the hexadecimal strings back into binary data that crypto can use
    const iv = Buffer.from(parts[0], 'hex'); 
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(algorithm, getKey(), iv);
    decipher.setAuthTag(authTag);
    
    //decrypts the text
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    throw new Error('Failed to decrypt data');
  }
}; //(siwalikm, 2020)

//this is for securely hashing passwords so that its stored safely in the db. 
const hashPassword = async (password) => {
  const bcrypt = require('bcrypt'); //uses bcrypt library for hashing passwords securely, uses salt as well for brute force attacks
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) ; //how many times bcrypt applies hashing internally.
  return await bcrypt.hash(password, saltRounds); //takes the password and returns the hashed string
};

//this checks if a original text password matches a hashed password stored in the db.
const comparePassword = async (password, hash) => {
  const bcrypt = require('bcrypt');
  return await bcrypt.compare(password, hash); //compare automatically and returns true or false.
};

module.exports = {
  encrypt,
  decrypt,
  hashPassword,
  comparePassword
}; //making these functions accessible in other files


/*
References: 
siwalikm. 2020. AES-256-CBC implementation in nodeJS with built-in Crypto library (Version 1.0) [Source code]. https://gist.github.com/siwalikm/8311cf0a287b98ef67c73c1b03b47154 (Accessed 2 October 2025). 

*/