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
const bodyParser = __importStar(require("body-parser"));
const express_1 = __importDefault(require("express"));
const lodash_1 = __importDefault(require("lodash"));
const blockchain_1 = require("./blockchain");
const p2p_1 = require("./p2p");
const transactionPool_1 = require("./transactionPool");
const wallet_1 = require("./wallet");
const httpPort = parseInt(process.env.HTTP_PORT ?? '3001', 10);
const p2pPort = parseInt(process.env.P2P_PORT ?? '6001', 10);
const initHttpServer = (myHttpPort) => {
    const app = (0, express_1.default)();
    app.use(bodyParser.json());
    // Global error handler
    app.use((err, req, res, next) => {
        if (err) {
            res.status(400).send(err.message);
        }
        else {
            next();
        }
    });
    // Get blockchain
    app.get('/blocks', (req, res) => {
        res.send((0, blockchain_1.getBlockchain)());
    });
    app.get('/unspentTransactionOutputs', (req, res) => {
        res.send((0, blockchain_1.getUnspentTxOuts)());
    });
    app.get('/myUnspentTransactionOutputs', (req, res) => {
        res.send((0, blockchain_1.getMyUnspentTransactionOutputs)());
    });
    // Get a specific block
    app.get('/block/:hash', (req, res) => {
        const block = (0, blockchain_1.getBlockchain)().find(b => b.hash === req.params.hash);
        if (block) {
            res.send(block);
        }
        else {
            res.status(404).send('Block not found');
        }
    });
    app.get('/transaction/:id', (req, res) => {
        const tx = (0, lodash_1.default)((0, blockchain_1.getBlockchain)())
            .map((blocks) => blocks.data)
            .flatten()
            .find({ 'id': req.params.id });
        res.send(tx);
    });
    app.get('/address/:address', (req, res) => {
        const unspentTxOuts = lodash_1.default.filter((0, blockchain_1.getUnspentTxOuts)(), (uTxO) => uTxO.address === req.params.address);
        res.send({ 'unspentTxOuts': unspentTxOuts });
    });
    app.post('/mineBlock', (req, res) => {
        const newBlock = (0, blockchain_1.generateNextBlock)();
        if (newBlock === null) {
            res.status(400).send('could not generate block');
        }
        else {
            res.send(newBlock);
        }
    });
    // Mine a raw block
    app.post('/mineRawBlock', (req, res) => {
        const data = req.body.data;
        if (data == null) {
            res.status(400).send('data parameter is missing');
            return;
        }
        const newBlock = (0, blockchain_1.generateRawNextBlock)(data);
        if (!newBlock) {
            res.status(400).send('could not generate block');
        }
        else {
            res.send(newBlock);
        }
    });
    // Mine a block with transaction
    app.post('/mineTransaction', (req, res) => {
        const { address, amount } = req.body;
        console.log(req.body);
        if (!address || amount == null) {
            res.status(400).send('address or amount missing');
            return;
        }
        try {
            const newBlock = (0, blockchain_1.generatenextBlockWithTransaction)(address, amount);
            res.send(newBlock);
        }
        catch (e) {
            console.error(e.message);
            res.status(400).send(e.message);
        }
    });
    app.post('/sendTransaction', (req, res) => {
        try {
            const address = req.body.address;
            const amount = req.body.amount;
            if (address === undefined || amount === undefined) {
                throw Error('invalid address or amount');
            }
            const resp = (0, blockchain_1.sendTransaction)(address, amount);
            res.send(resp);
        }
        catch (e) {
            console.log(e.message);
            res.status(400).send(e.message);
        }
    });
    app.get('/transactionPool', (req, res) => {
        res.send((0, transactionPool_1.getTransactionPool)());
    });
    // Get balance
    app.get('/balance', (req, res) => {
        const balance = (0, blockchain_1.getAccountBalance)();
        res.send({ balance });
    });
    app.get('/address', (req, res) => {
        const address = (0, wallet_1.getPublicFromWallet)();
        res.send({ 'address': address });
    });
    // List peers
    app.get('/peers', (req, res) => {
        res.send((0, p2p_1.getSockets)().map((s) => `${s._socket.remoteAddress}:${s._socket.remotePort}`));
    });
    // Add a new peer
    app.post('/addPeer', (req, res) => {
        const peer = req.body.peer;
        if (!peer) {
            res.status(400).send('peer parameter missing');
            return;
        }
        (0, p2p_1.connectToPeers)(peer);
        res.send();
    });
    app.post('/stop', (req, res) => {
        res.send({ 'msg': 'stopping server' });
        process.exit();
    });
    // Start HTTP server
    app.listen(myHttpPort, () => {
        console.log(`Listening HTTP on port: ${myHttpPort}`);
    });
};
// Initialize servers and wallet
initHttpServer(httpPort);
(0, p2p_1.initP2PServer)(p2pPort);
(0, wallet_1.initWallet)();
//# sourceMappingURL=main.js.map