"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addBlockToChain = exports.replaceChain = exports.isValidBlockStructure = exports.getAccountBalance = exports.getMyUnspentTransactionOutputs = exports.handleReceivedTransaction = exports.generatenextBlockWithTransaction = exports.generateNextBlock = exports.generateRawNextBlock = exports.sendTransaction = exports.getLatestBlock = exports.getUnspentTxOuts = exports.getBlockchain = exports.Block = void 0;
const CryptoJS = __importStar(require("crypto-js"));
const lodash_1 = __importDefault(require("lodash"));
const p2p_1 = require("./p2p");
const util_1 = require("./util");
const transaction_1 = require("./transaction");
const transactionPool_1 = require("./transactionPool");
const wallet_1 = require("./wallet");
class Block {
    constructor(index, hash, previousHash, timestamp, data, difficulty, nonce) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash;
        this.difficulty = difficulty;
        this.nonce = nonce;
    }
}
exports.Block = Block;
// The GenesisBlock is the first block in the block chain and it is the only block with no previousHash 
const genesisTransaction = {
    'txIns': [{ 'signature': '', 'txOutId': '', 'txOutIndex': 0 }],
    'txOuts': [{
            'address': '04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a',
            'amount': 50
        }],
    'id': 'e655f6a5f26dc9b4cac6e46f52336428287759cf81ef5ff10854f69d68f43fa3'
};
// So needed to hard code it in
const genesisBlock = new Block(0, '91a73664bc84c0baa1fc75ea6e4aa6d1d20c5df664c724e3159aefc2e1186627', '', 1465154705, [genesisTransaction], 0, 0);
//storing the block in memory 
let blockchain = [genesisBlock];
const initialUnspentTxOuts = (0, transaction_1.processTransactions)(blockchain[0].data, [], 0);
if (initialUnspentTxOuts === null) {
    throw new Error('Failed to initialize unspent transaction outputs');
}
let unspentTxOuts = initialUnspentTxOuts;
const getBlockchain = () => blockchain;
exports.getBlockchain = getBlockchain;
const getUnspentTxOuts = () => lodash_1.default.cloneDeep(unspentTxOuts);
exports.getUnspentTxOuts = getUnspentTxOuts;
// and txPool should be only updated at the same time
const setUnspentTxOuts = (newUnspentTxOut) => {
    console.log('replacing unspentTxouts with: %s', newUnspentTxOut);
    unspentTxOuts = newUnspentTxOut;
};
const getLatestBlock = () => blockchain[blockchain.length - 1];
exports.getLatestBlock = getLatestBlock;
// in seconds 
const BLOCK_GENERATION_INTERVAL = 10;
// in blocks
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10;
const getDifficulty = (aBlockchain) => {
    const latestBlock = aBlockchain[blockchain.length - 1];
    if (latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.index !== 0) {
        return getAdjustedDifficulty(latestBlock, aBlockchain);
    }
    else {
        return latestBlock.difficulty;
    }
};
const getAdjustedDifficulty = (latestBlock, aBlockchain) => {
    const prevAdjustmentBlock = aBlockchain[aBlockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
    const timeExpected = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
    const timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
    if (timeTaken < timeExpected / 2) {
        return prevAdjustmentBlock.difficulty + 1;
    }
    else if (timeTaken > timeExpected * 2) {
        return prevAdjustmentBlock.difficulty - 1;
    }
    else {
        return prevAdjustmentBlock.difficulty;
    }
};
const getCurrentTimestamp = () => Math.round(new Date().getTime() / 1000);
// calculates the hash using the index, previousHash, timestamp, and the data 
const calculateHash = (index, previousHash, timestamp, data, difficulty, nonce) => CryptoJS.SHA256(index + previousHash + timestamp + data + difficulty + nonce).toString();
const generateRawNextBlock = (blockData) => {
    const previousBlock = getLatestBlock();
    const difficulty = getDifficulty(getBlockchain());
    console.log('difficulty: ' + difficulty);
    const nextIndex = previousBlock.index + 1; // index +1
    const nextTimestamp = getCurrentTimestamp();
    const newBlock = findBlock(nextIndex, previousBlock.hash, nextTimestamp, blockData, difficulty);
    if (addBlockToChain(newBlock)) {
        (0, p2p_1.broadcastLatest)();
        return newBlock;
    }
    else {
        return null;
    }
};
exports.generateRawNextBlock = generateRawNextBlock;
const getMyUnspentTransactionOutputs = () => {
    return (0, wallet_1.findUnspentTxOuts)((0, wallet_1.getPublicFromWallet)(), getUnspentTxOuts());
};
exports.getMyUnspentTransactionOutputs = getMyUnspentTransactionOutputs;
const generateNextBlock = () => {
    const coinbaseTx = (0, transaction_1.getCoinbaseTransaction)((0, wallet_1.getPublicFromWallet)(), getLatestBlock().index + 1);
    const blockData = [coinbaseTx].concat((0, transactionPool_1.getTransactionPool)());
    return generateRawNextBlock(blockData);
};
exports.generateNextBlock = generateNextBlock;
const generatenextBlockWithTransaction = (receiverAddress, amount) => {
    if (!(0, transaction_1.isValidAddress)(receiverAddress)) {
        throw Error('invalid address');
    }
    if (typeof amount !== 'number') {
        throw Error('invalid amount');
    }
    const coinbaseTx = (0, transaction_1.getCoinbaseTransaction)((0, wallet_1.getPublicFromWallet)(), getLatestBlock().index + 1);
    const tx = (0, wallet_1.createTransaction)(receiverAddress, amount, (0, wallet_1.getPrivateFromWallet)(), unspentTxOuts, (0, transactionPool_1.getTransactionPool)());
    const blockData = [coinbaseTx, tx];
    return generateRawNextBlock(blockData);
};
exports.generatenextBlockWithTransaction = generatenextBlockWithTransaction;
const findBlock = (index, previousHash, timestamp, data, difficulty) => {
    let nonce = 0;
    while (true) {
        const hash = calculateHash(index, previousHash, timestamp, data, difficulty, nonce);
        if (hashMatchesDifficulty(hash, difficulty)) {
            return new Block(index, hash, previousHash, timestamp, data, difficulty, nonce);
        }
        nonce++;
    }
};
const getAccountBalance = () => {
    return (0, wallet_1.getBalance)((0, wallet_1.getPublicFromWallet)(), getUnspentTxOuts());
};
exports.getAccountBalance = getAccountBalance;
const sendTransaction = (address, amount) => {
    const tx = (0, wallet_1.createTransaction)(address, amount, (0, wallet_1.getPrivateFromWallet)(), getUnspentTxOuts(), (0, transactionPool_1.getTransactionPool)());
    (0, transactionPool_1.addToTransactionPool)(tx, getUnspentTxOuts());
    (0, p2p_1.broadCastTransactionPool)();
    return tx;
};
exports.sendTransaction = sendTransaction;
const calculateHashForBlock = (block) => calculateHash(block.index, block.previousHash, block.timestamp, block.data, block.difficulty, block.nonce);
// Validation for integrity 
const isValidNewBlock = (newBlock, previousBlock) => {
    if (!isValidBlockStructure(newBlock)) {
        console.log('invalid block structure: %s', JSON.stringify(newBlock));
        return false;
    }
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('invalid index');
        return false;
    }
    else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('invalid previoushash');
        return false;
    }
    else if (!isValidTimestamp(newBlock, previousBlock)) {
        console.log('invalid timestamp');
        return false;
    }
    else if (!hasValidHash(newBlock)) {
        return false;
    }
    return true;
};
const getAccumulatedDifficulty = (aBlockchain) => {
    return aBlockchain
        .map((block) => block.difficulty)
        .map((difficulty) => Math.pow(2, difficulty))
        .reduce((a, b) => a + b);
};
const isValidTimestamp = (newBlock, previousBlock) => {
    return (previousBlock.timestamp - 60 < newBlock.timestamp)
        && newBlock.timestamp - 60 < getCurrentTimestamp();
};
const hasValidHash = (block) => {
    if (!hashMatchesBlockContent(block)) {
        console.log('invalid hash, got:' + block.hash);
        return false;
    }
    if (!hashMatchesDifficulty(block.hash, block.difficulty)) {
        console.log('block difficulty not satisfied. Expected: ' + block.difficulty + 'got: ' + block.hash);
        return false;
    }
    return true;
};
const hashMatchesBlockContent = (block) => {
    const blockHash = calculateHashForBlock(block);
    return blockHash === block.hash;
};
const hashMatchesDifficulty = (hash, difficulty) => {
    const hashInBinary = (0, util_1.hexToBinary)(hash);
    if (hashInBinary === null) {
        return false;
    }
    const requiredPrefix = '0'.repeat(difficulty);
    return hashInBinary.startsWith(requiredPrefix);
};
// validating the structure of the block for peer
const isValidBlockStructure = (block) => {
    return typeof block.index === 'number'
        && typeof block.hash === 'string'
        && typeof block.previousHash === 'string'
        && typeof block.timestamp === 'number'
        && typeof block.data === 'object';
};
exports.isValidBlockStructure = isValidBlockStructure;
// Validate the chain using the genesis Blockchain
const isValidChain = (blockchainToValidate) => {
    console.log('isValidChain:');
    console.log(JSON.stringify(blockchainToValidate));
    const isValidGenesis = (block) => {
        return JSON.stringify(block) === JSON.stringify(genesisBlock);
    };
    if (!isValidGenesis(blockchainToValidate[0])) {
        return null;
    }
    /*
    Validate each block in the chain. The block is valid if the block structure is valid
      and the transaction are valid
     */
    let aUnspentTxOuts = [];
    for (let i = 0; i < blockchainToValidate.length; i++) {
        const currentBlock = blockchainToValidate[i];
        if (i !== 0 && !isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i - 1])) {
            return null;
        }
        aUnspentTxOuts = (0, transaction_1.processTransactions)(currentBlock.data, aUnspentTxOuts, currentBlock.index);
        if (aUnspentTxOuts === null) {
            console.log('invalid transactions in blockchain');
            return null;
        }
    }
    return aUnspentTxOuts;
};
const addBlockToChain = (newBlock) => {
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        const retVal = (0, transaction_1.processTransactions)(newBlock.data, getUnspentTxOuts(), newBlock.index);
        if (retVal === null) {
            console.log('block is not valid in terms of transactions');
            return false;
        }
        else {
            blockchain.push(newBlock);
            setUnspentTxOuts(retVal);
            (0, transactionPool_1.updateTransactionPool)(unspentTxOuts);
            return true;
        }
    }
    return false;
};
exports.addBlockToChain = addBlockToChain;
// Initial Conflicts so the longer chain dominates
const replaceChain = (newBlocks) => {
    const aUnspentTxOuts = isValidChain(newBlocks);
    if (aUnspentTxOuts === null) {
        console.log('Received blockchain invalid');
        return;
    }
    if (getAccumulatedDifficulty(newBlocks) >
        getAccumulatedDifficulty(getBlockchain())) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
        blockchain = newBlocks;
        setUnspentTxOuts(aUnspentTxOuts);
        (0, transactionPool_1.updateTransactionPool)(aUnspentTxOuts);
        (0, p2p_1.broadcastLatest)();
    }
    else {
        console.log('Received blockchain invalid');
    }
};
exports.replaceChain = replaceChain;
const handleReceivedTransaction = (transaction) => {
    (0, transactionPool_1.addToTransactionPool)(transaction, getUnspentTxOuts());
};
exports.handleReceivedTransaction = handleReceivedTransaction;
//# sourceMappingURL=blockchain.js.map