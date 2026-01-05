import * as CryptoJS from 'crypto-js';

class Block {

    public index: number;
    public hash: string;
    public previousHash: string;
    public timestamp: number;
    public data: string;

    constructor(index: number, hash: string, previousHash: string, timestamp: number, data: string){
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash;
    }

}

// The GenesisBlock is the first block in the block chain and it is the only block with no previousHash 
// So needed to hard code it in
const genesisBlock: Block = new Block(
    0, '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7', '', 1465154705, 'my genesis block!!'
);

// calculates the hash using the index, previousHash, timestamp, and the data 
const calculateHash = (index: number, hash: string, previousHash: string, timestamp: number, data: string) =>
    CryptoJS.SHA256(index + previousHash + timestamp + data).toString();

const generateNextBlock = (blockData: string) => {
    const previousBlock: Block = getLatestBlock();
    const nextIndex: number = previousBlock.index + 1; // index +1
    const nextTimestamp: number = new Date().getTime() / 1000;
    const nextHash: string = calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);// Gets the new block 
    const newBlock: Block = new Block(nextIndex, nextHash, previousBlock.hash, nextTimestamp, blockData);
    return newBlock;
}
//storing the block in memory 
const blockchain: Block[] = [genesisBlock];

// Validation for integrity 
const isValidNewBlock = (newBlock: Block, previousBlock: Block) => {
    if(previousBlock.index + 1 !== newBlock.index) {
        console.log('invaild index');
        return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('invalid previoushash');
        return false;
    }else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
        console.log(typeof (newBlock.hash) + ' ' + typeof calculateHashForBlock(newBlock));
        console.log('invalid hash: ' + calculateHashForBlock(newBlock) + ' ' + newBlock.hash);
        return false;
    }
    return true;
}