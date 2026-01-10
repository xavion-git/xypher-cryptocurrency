"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWallet = exports.generatePrivateKey = exports.getBalance = exports.getPrivateFromWallet = exports.getPublicFromWallet = exports.createTransaction = void 0;
const elliptic_1 = require("elliptic");
const fs_1 = require("fs");
const lodash_1 = __importDefault(require("lodash"));
const transaction_1 = require("./transaction");
const EC = new elliptic_1.ec('secp256k1');
const privateKeyLocation = 'node/wallet/private_key';
const getPrivateFromWallet = () => {
    const buffer = (0, fs_1.readFileSync)(privateKeyLocation, 'utf8');
    return buffer.toString();
};
exports.getPrivateFromWallet = getPrivateFromWallet;
const getPublicFromWallet = () => {
    const privateKey = getPrivateFromWallet();
    const key = EC.keyFromPrivate(privateKey, 'hex');
    return key.getPublic().encode('hex', false);
};
exports.getPublicFromWallet = getPublicFromWallet;
const generatePrivateKey = () => {
    const keyPair = EC.genKeyPair();
    const privateKey = keyPair.getPrivate();
    return privateKey.toString(16);
};
exports.generatePrivateKey = generatePrivateKey;
const initWallet = () => {
    // let's not override existing private keys
    if ((0, fs_1.existsSync)(privateKeyLocation)) {
        return;
    }
    const newPrivateKey = generatePrivateKey();
    (0, fs_1.writeFileSync)(privateKeyLocation, newPrivateKey);
    console.log('new wallet with private key created');
};
exports.initWallet = initWallet;
const getBalance = (address, unspentTxOuts) => {
    return (0, lodash_1.default)(unspentTxOuts)
        .filter((uTxO) => uTxO.address === address)
        .map((uTxO) => uTxO.amount)
        .sum();
};
exports.getBalance = getBalance;
const findTxOutsForAmount = (amount, myUnspentTxOuts) => {
    let currentAmount = 0;
    const includedUnspentTxOuts = [];
    for (const myUnspentTxOut of myUnspentTxOuts) {
        includedUnspentTxOuts.push(myUnspentTxOut);
        currentAmount = currentAmount + myUnspentTxOut.amount;
        if (currentAmount >= amount) {
            const leftOverAmount = currentAmount - amount;
            return { includedUnspentTxOuts, leftOverAmount };
        }
    }
    throw Error('not enough coins to send transaction');
};
const createTxOuts = (receiverAddress, myAddress, amount, leftOverAmount) => {
    const txOut1 = new transaction_1.TxOut(receiverAddress, amount);
    if (leftOverAmount === 0) {
        return [txOut1];
    }
    else {
        const leftOverTx = new transaction_1.TxOut(myAddress, leftOverAmount);
        return [txOut1, leftOverTx];
    }
};
const createTransaction = (receiverAddress, amount, privateKey, unspentTxOuts) => {
    const myAddress = (0, transaction_1.getPublicKey)(privateKey);
    const myUnspentTxOuts = unspentTxOuts.filter(uTxO => uTxO.address === myAddress);
    const { includedUnspentTxOuts, leftOverAmount } = findTxOutsForAmount(amount, myUnspentTxOuts);
    const unsignedTxIns = includedUnspentTxOuts.map(uTxO => new transaction_1.TxIn(uTxO.txOutId, uTxO.txOutIndex, ''));
    const tx = new transaction_1.Transaction(unsignedTxIns, createTxOuts(receiverAddress, myAddress, amount, leftOverAmount));
    // Set transaction ID
    tx.id = (0, transaction_1.getTransactionId)(tx);
    // Sign each txIn
    tx.txIns = tx.txIns.map((txIn, index) => {
        txIn.signature = (0, transaction_1.signTxIn)(tx, index, privateKey, unspentTxOuts);
        return txIn;
    });
    return tx;
};
exports.createTransaction = createTransaction;
//# sourceMappingURL=wallet.js.map