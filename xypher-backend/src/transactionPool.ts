import _ from 'lodash';
import { Transaction, TxIn, UnspentTxOut, validateTransaction, getTransactionFee } from './transaction';

let transactionPool: Transaction[] = [];

const MAX_TRANSACTION_POOL_SIZE = 1000;

const getTransactionPool = () => _.cloneDeep(transactionPool);

// FIX: now exported and used in generateNextBlock for fee-prioritized mining
const getTransactionPoolSorted = (unspentTxOuts: UnspentTxOut[]): Transaction[] => {
    return _.orderBy(
        transactionPool,
        [(tx) => {
            try { return getTransactionFee(tx, unspentTxOuts); }
            catch { return 0; }
        }],
        ['desc']
    );
};

const addToTransactionPool = (tx: Transaction, unspentTxOuts: UnspentTxOut[]) => {
    if (transactionPool.length >= MAX_TRANSACTION_POOL_SIZE) {
        throw Error('Transaction pool is full');
    }
    if (!validateTransaction(tx, unspentTxOuts)) {
        throw Error('Trying to add invalid tx to pool');
    }
    if (!isValidTxForPool(tx, transactionPool)) {
        throw Error('Trying to add duplicate tx to pool');
    }
    console.log('➕ Adding to txPool:', tx.id);
    transactionPool.push(tx);
};

const hasTxIn = (txIn: TxIn, unspentTxOuts: UnspentTxOut[]): boolean => {
    return unspentTxOuts.some((uTxO) => uTxO.txOutId === txIn.txOutId && uTxO.txOutIndex === txIn.txOutIndex);
};

const updateTransactionPool = (unspentTxOuts: UnspentTxOut[]) => {
    const invalidTxs = transactionPool.filter(tx =>
        tx.txIns.some(txIn => !hasTxIn(txIn, unspentTxOuts))
    );
    if (invalidTxs.length > 0) {
        console.log('🗑️  Removing', invalidTxs.length, 'invalidated txs from pool');
        transactionPool = _.without(transactionPool, ...invalidTxs);
    }
};

const getTxPoolIns = (aTransactionPool: Transaction[]): TxIn[] =>
    _(aTransactionPool).map((tx) => tx.txIns).flatten().value();

const isValidTxForPool = (tx: Transaction, aTtransactionPool: Transaction[]): boolean => {
    const txPoolIns: TxIn[] = getTxPoolIns(aTtransactionPool);
    for (const txIn of tx.txIns) {
        if (txPoolIns.some(p => p.txOutIndex === txIn.txOutIndex && p.txOutId === txIn.txOutId)) {
            console.log('txIn already found in the txPool');
            return false;
        }
    }
    return true;
};

export { addToTransactionPool, getTransactionPool, getTransactionPoolSorted, updateTransactionPool };
