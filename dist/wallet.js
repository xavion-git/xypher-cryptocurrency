"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUnspentTxOuts = exports.deleteWallet = exports.initWallet = exports.generatePrivateKey = exports.getBalance = exports.getPrivateFromWallet = exports.getPublicFromWallet = exports.createTransaction = void 0;
const elliptic_1 = require("elliptic");
const fs_1 = require("fs");
const lodash_1 = __importDefault(require("lodash"));
const transaction_1 = require("./transaction");
const EC = new elliptic_1.ec('secp256k1');
const privateKeyLocation = process.env.PRIVATE_KEY || 'node/wallet/private_key';
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
    console.log('new wallet with private key created to : &s', privateKeyLocation);
};
exports.initWallet = initWallet;
const deleteWallet = () => {
    if ((0, fs_1.existsSync)(privateKeyLocation)) {
        (0, fs_1.unlinkSync)(privateKeyLocation);
    }
};
exports.deleteWallet = deleteWallet;
const getBalance = (address, unspentTxOuts) => {
    return (0, lodash_1.default)(findUnspentTxOuts(address, unspentTxOuts))
        .map((uTxO) => uTxO.amount)
        .sum();
};
exports.getBalance = getBalance;
const findUnspentTxOuts = (ownerAddress, unspentTxOuts) => {
    return lodash_1.default.filter(unspentTxOuts, (uTxO) => uTxO.address === ownerAddress);
};
exports.findUnspentTxOuts = findUnspentTxOuts;
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
    const eMsg = 'Cannot create transaction from the available unspent transaction outputs.' +
        ' Required amount:' + amount + '. Available unspentTxOuts:' + JSON.stringify(myUnspentTxOuts);
    throw Error(eMsg);
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
const filterTxPoolTxs = (unspentTxOuts, transactionPool) => {
    const txIns = (0, lodash_1.default)(transactionPool)
        .map((tx) => tx.txIns)
        .flatten()
        .value();
    const removable = [];
    for (const unspentTxOut of unspentTxOuts) {
        const txIn = lodash_1.default.find(txIns, (aTxIn) => {
            return aTxIn.txOutIndex === unspentTxOut.txOutIndex && aTxIn.txOutId === unspentTxOut.txOutId;
        });
        if (txIn === undefined) {
        }
        else {
            removable.push(unspentTxOut);
        }
    }
    return lodash_1.default.without(unspentTxOuts, ...removable);
};
const createTransaction = (receiverAddress, amount, privateKey, unspentTxOuts, txPool) => {
    console.log('txPool: %s', JSON.stringify(txPool));
    const myAddress = (0, transaction_1.getPublicKey)(privateKey);
    const myUnspentTxOutsA = unspentTxOuts.filter((uTxO) => uTxO.address === myAddress);
    const myUnspentTxOuts = filterTxPoolTxs(myUnspentTxOutsA, txPool);
    // filters from unspentOutputs such inputs that are referenced in pool
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