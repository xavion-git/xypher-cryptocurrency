import * as CryptoJS from 'crypto-js';
import _ from 'lodash';
import { broadcastLatest, broadCastTransactionPool } from './p2p';
import { hexToBinary } from './util';
import { getCoinbaseTransaction, isValidAddress, processTransactions, Transaction, UnspentTxOut, getTransactionFee } from './transaction';
import { addToTransactionPool, getTransactionPool, getTransactionPoolSorted, updateTransactionPool } from './transactionPool';
import { createTransaction, findUnspentTxOuts, getBalance, getPrivateFromWallet, getPublicFromWallet } from './wallet';
import { BlockModel } from './models/block.model';

export class Block {
    public index: number;
    public hash: string;
    public previousHash: string;
    public timestamp: number;
    public data: Transaction[];
    public difficulty: number;
    public nonce: number;

    constructor(index: number, hash: string, previousHash: string, timestamp: number, data: Transaction[], difficulty: number, nonce: number) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash;
        this.difficulty = difficulty;
        this.nonce = nonce;
    }
}

export async function loadBlockchain() {
    const blocks = await BlockModel.find().sort({ index: 1 });
    if (blocks.length > 0) {
        blockchain = blocks as unknown as Block[];
        // Rebuild unspent tx outs from persisted chain
        let aUnspentTxOuts: UnspentTxOut[] = [];
        for (let i = 0; i < blockchain.length; i++) {
            const result = processTransactions(blockchain[i].data, aUnspentTxOuts, blockchain[i].index);
            if (result !== null) aUnspentTxOuts = result;
        }
        unspentTxOuts = aUnspentTxOuts;
        console.log(`✅ Loaded ${blockchain.length} blocks from database`);
    } else {
        console.log('📦 No existing chain found, starting with genesis block');
    }
}

async function persistBlock(block: Block): Promise<void> {
    try {
        await BlockModel.create(block);
    } catch (err) {
        console.error('❌ Failed to persist block:', err);
        throw err;
    }
}

const genesisTransaction = {
    'txIns': [{ 'signature': '', 'txOutId': '', 'txOutIndex': 0 }],
    'txOuts': [{
        'address': '04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a',
        'amount': 50
    }],
    'id': 'e655f6a5f26dc9b4cac6e46f52336428287759cf81ef5ff10854f69d68f43fa3'
};

const genesisBlock: Block = new Block(
    0, '91a73664bc84c0baa1fc75ea6e4aa6d1d20c5df664c724e3159aefc2e1186627', '', 1465154705, [genesisTransaction], 0, 0
);

let blockchain: Block[] = [genesisBlock];

const initialUnspentTxOuts = processTransactions(blockchain[0].data, [], 0);
if (initialUnspentTxOuts === null) {
    throw new Error('Failed to initialize unspent transaction outputs');
}
let unspentTxOuts: UnspentTxOut[] = initialUnspentTxOuts;

const getBlockchain = (): Block[] => blockchain;
const getUnspentTxOuts = (): UnspentTxOut[] => _.cloneDeep(unspentTxOuts);
const setUnspentTxOuts = (newUnspentTxOut: UnspentTxOut[]) => {
    if (!Array.isArray(newUnspentTxOut)) throw new Error('Invalid unspent transaction outputs');
    unspentTxOuts = _.cloneDeep(newUnspentTxOut);
};
const getLatestBlock = (): Block => blockchain[blockchain.length - 1];

const BLOCK_GENERATION_INTERVAL: number = 10;
const DIFFICULTY_ADJUSTMENT_INTERVAL: number = 10;

const getDifficulty = (aBlockchain: Block[]): number => {
    const latestBlock: Block = aBlockchain[blockchain.length - 1];
    if (latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.index !== 0) {
        return getAdjustedDifficulty(latestBlock, aBlockchain);
    } else {
        return latestBlock.difficulty;
    }
};

const getAdjustedDifficulty = (latestBlock: Block, aBlockchain: Block[]) => {
    const prevAdjustmentBlock: Block = aBlockchain[aBlockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
    const timeExpected: number = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
    const timeTaken: number = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
    if (timeTaken < timeExpected / 2) return prevAdjustmentBlock.difficulty + 1;
    else if (timeTaken > timeExpected * 2) return Math.max(0, prevAdjustmentBlock.difficulty - 1);
    else return prevAdjustmentBlock.difficulty;
};

const getCurrentTimestamp = (): number => Math.round(new Date().getTime() / 1000);

const calculateHash = (index: number, previousHash: string, timestamp: number, data: Transaction[], difficulty: number, nonce: number): string =>
    CryptoJS.SHA256(index + previousHash + timestamp + JSON.stringify(data) + difficulty + nonce).toString();

export const generateRawNextBlock = async (blockData: Transaction[]) => {
    const previousBlock: Block = getLatestBlock();
    const difficulty: number = getDifficulty(getBlockchain());
    console.log('⛏️  Mining block at difficulty: ' + difficulty);
    const nextIndex: number = previousBlock.index + 1;
    const nextTimestamp: number = getCurrentTimestamp();
    const newBlock: Block = findBlock(nextIndex, previousBlock.hash, nextTimestamp, blockData, difficulty);
    if (await addBlockToChain(newBlock)) {
        broadcastLatest();
        return newBlock;
    } else {
        return null;
    }
};

const getMyUnspentTransactionOutputs = () => {
    return findUnspentTxOuts(getPublicFromWallet(), getUnspentTxOuts());
};

// FIX: was missing async/await
const generateNextBlock = async () => {
    const poolTransactions = getTransactionPoolSorted(getUnspentTxOuts()); // FIX: use fee-sorted pool
    const coinbaseTx: Transaction = getCoinbaseTransaction(
        getPublicFromWallet(),
        getLatestBlock().index + 1,
        poolTransactions,
        getUnspentTxOuts()
    );
    const blockData: Transaction[] = [coinbaseTx].concat(poolTransactions);
    return generateRawNextBlock(blockData);
};

const generatenextBlockWithTransaction = (receiverAddress: string, amount: number) => {
    if (!isValidAddress(receiverAddress)) throw Error('invalid address');
    if (typeof amount !== 'number') throw Error('invalid amount');
    const tx: Transaction = createTransaction(
        receiverAddress, amount, getPrivateFromWallet(), unspentTxOuts, getTransactionPool()
    );
    const coinbaseTx: Transaction = getCoinbaseTransaction(
        getPublicFromWallet(), getLatestBlock().index + 1, [tx], getUnspentTxOuts()
    );
    const blockData: Transaction[] = [coinbaseTx, tx];
    return generateRawNextBlock(blockData);
};

const findBlock = (index: number, previousHash: string, timestamp: number, data: Transaction[], difficulty: number): Block => {
    let nonce = 0;
    while (true) {
        const hash: string = calculateHash(index, previousHash, timestamp, data, difficulty, nonce);
        if (hashMatchesDifficulty(hash, difficulty)) {
            return new Block(index, hash, previousHash, timestamp, data, difficulty, nonce);
        }
        nonce++;
    }
};

const getAccountBalance = (): number => getBalance(getPublicFromWallet(), getUnspentTxOuts());

const sendTransaction = (address: string, amount: number): Transaction => {
    const tx: Transaction = createTransaction(address, amount, getPrivateFromWallet(), getUnspentTxOuts(), getTransactionPool());
    addToTransactionPool(tx, getUnspentTxOuts());
    broadCastTransactionPool();
    return tx;
};

const calculateHashForBlock = (block: Block): string =>
    calculateHash(block.index, block.previousHash, block.timestamp, block.data, block.difficulty, block.nonce);

const MAX_BLOCK_SIZE = 1000000;
const getBlockSize = (block: Block): number => JSON.stringify(block.data).length;

const isValidNewBlock = (newBlock: Block, previousBlock: Block): boolean => {
    if (!isValidBlockStructure(newBlock)) {
        console.log('invalid block structure: %s', JSON.stringify(newBlock));
        return false;
    }
    if (getBlockSize(newBlock) > MAX_BLOCK_SIZE) {
        console.log('block exceeds max size');
        return false;
    }
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('invalid index');
        return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('invalid previoushash');
        return false;
    } else if (!isValidTimestamp(newBlock, previousBlock)) {
        console.log('invalid timestamp');
        return false;
    } else if (!hasValidHash(newBlock)) {
        return false;
    }
    return true;
};

const getAccumulatedDifficulty = (aBlockchain: Block[]): number =>
    aBlockchain.map((block) => block.difficulty).map((difficulty) => Math.pow(2, difficulty)).reduce((a, b) => a + b);

const isValidTimestamp = (newBlock: Block, previousBlock: Block): boolean => {
    if (newBlock.timestamp < previousBlock.timestamp) return false;
    if (newBlock.timestamp > getCurrentTimestamp() + 10) return false;
    return true;
};

const hasValidHash = (block: Block): boolean => {
    if (!hashMatchesBlockContent(block)) {
        console.log('invalid hash, got:' + block.hash);
        return false;
    }
    if (!hashMatchesDifficulty(block.hash, block.difficulty)) {
        console.log('block difficulty not satisfied');
        return false;
    }
    return true;
};

const hashMatchesBlockContent = (block: Block): boolean => calculateHashForBlock(block) === block.hash;

const hashMatchesDifficulty = (hash: string, difficulty: number): boolean => {
    const hashInBinary = hexToBinary(hash);
    if (hashInBinary === null) return false;
    return hashInBinary.startsWith('0'.repeat(difficulty));
};

const isValidBlockStructure = (block: Block): boolean =>
    typeof block.index === 'number'
    && typeof block.hash === 'string'
    && typeof block.previousHash === 'string'
    && typeof block.timestamp === 'number'
    && typeof block.data === 'object';

const isValidChain = (blockchainToValidate: Block[]): UnspentTxOut[] | null => {
    const isValidGenesis = (block: Block): boolean => JSON.stringify(block) === JSON.stringify(genesisBlock);
    if (!isValidGenesis(blockchainToValidate[0])) return null;

    let aUnspentTxOuts: UnspentTxOut[] | null = [];
    for (let i = 0; i < blockchainToValidate.length; i++) {
        const currentBlock: Block = blockchainToValidate[i];
        if (i !== 0 && !isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i - 1])) return null;
        aUnspentTxOuts = processTransactions(currentBlock.data, aUnspentTxOuts, currentBlock.index);
        if (aUnspentTxOuts === null) {
            console.log('invalid transactions in blockchain');
            return null;
        }
    }
    return aUnspentTxOuts;
};

// FIX: persistBlock was called after return, so blocks were never saved. Now fixed.
const addBlockToChain = async (newBlock: Block): Promise<boolean> => {
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        const retVal = processTransactions(newBlock.data, getUnspentTxOuts(), newBlock.index);
        if (retVal === null) {
            console.log('block is not valid in terms of transactions');
            return false;
        }
        blockchain.push(newBlock);
        setUnspentTxOuts(retVal);
        updateTransactionPool(unspentTxOuts);
        await persistBlock(newBlock); // FIX: moved before return so blocks are actually saved
        return true;
    }
    return false;
};

const replaceChain = (newBlocks: Block[]) => {
    const aUnspentTxOuts = isValidChain(newBlocks);
    if (aUnspentTxOuts === null) {
        console.log('Received blockchain invalid');
        return;
    }
    if (getAccumulatedDifficulty(newBlocks) > getAccumulatedDifficulty(getBlockchain())) {
        console.log('Replacing chain with longer valid chain');
        blockchain = newBlocks;
        setUnspentTxOuts(aUnspentTxOuts);
        updateTransactionPool(aUnspentTxOuts);
        broadcastLatest();
    } else {
        console.log('Received blockchain is not longer. Ignoring.');
    }
};

const handleReceivedTransaction = (transaction: Transaction) => {
    addToTransactionPool(transaction, getUnspentTxOuts());
};

export {
    Block as BlockClass, getBlockchain, getUnspentTxOuts, getLatestBlock, sendTransaction,
    generateNextBlock, generatenextBlockWithTransaction,
    handleReceivedTransaction, getMyUnspentTransactionOutputs,
    getAccountBalance, isValidBlockStructure, replaceChain, addBlockToChain
};
