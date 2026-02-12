import * as bodyParser from 'body-parser';
import express, { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import {
    Block,
    generateNextBlock,
    generatenextBlockWithTransaction,
    generateRawNextBlock,
    getAccountBalance,
    getBlockchain,
    getMyUnspentTransactionOutputs,
    getUnspentTxOuts,
    loadBlockchain,
    sendTransaction
} from './blockchain';
import { connectToPeers, getSockets, initP2PServer } from './p2p';
import { UnspentTxOut } from './transaction';
import {getTransactionPool} from './transactionPool';
import {getPublicFromWallet, initWallet} from './wallet';
import cors from 'cors';
import { connectDB } from './database';

const httpPort: number = parseInt(process.env.HTTP_PORT ?? '3001', 10);
const p2pPort: number = parseInt(process.env.P2P_PORT ?? '6001', 10);

const initHttpServer = (myHttpPort: number) => {
    const app = express();
    app.use(cors({
        origin: 'http://localhost:4200', 
        credentials: true
    }));

    app.use(bodyParser.json());

    // Global error handler
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            next();
        }
    });

    // Get blockchain
    app.get('/blocks', (req: Request, res: Response) => {
        res.send(getBlockchain());
    });

       app.get('/unspentTransactionOutputs', (req: Request, res: Response) => {
        res.send(getUnspentTxOuts());
    });

    app.get('/myUnspentTransactionOutputs', (req: Request, res: Response) => {
        res.send(getMyUnspentTransactionOutputs());
    });

     // Get a specific block
    app.get('/block/:hash', (req: Request, res: Response) => {
        const block = getBlockchain().find(b => b.hash === req.params.hash);
        if (block) {
            res.send(block);
        } else {
            res.status(404).send('Block not found');
        }
    });

    app.get('/transaction/:id', (req, res) => {
        const tx = _(getBlockchain())
            .map((blocks) => blocks.data)
            .flatten()
            .find({'id': req.params.id});
        res.send(tx);
    });

    app.get('/address/:address', (req, res) => {
        const unspentTxOuts: UnspentTxOut[] =
            _.filter(getUnspentTxOuts(), (uTxO) => uTxO.address === req.params.address);
        res.send({'unspentTxOuts': unspentTxOuts});
    });


      app.post('/mineBlock', async (req: Request, res: Response) => {
        const newBlock: Block | null = await generateNextBlock();

        if (!newBlock) {
            res.status(400).send('could not generate block');
        } else {
            res.send(newBlock);
        }
    });

    // Mine a raw block
    app.post('/mineRawBlock', async (req: Request, res: Response) => {
        const data = req.body.data;

        if (!data) {
            res.status(400).send('data parameter is missing');
            return;
         }

        const newBlock: Block | null = await generateRawNextBlock(data);

        if (!newBlock) {
            res.status(400).send('could not generate block');
        } else {
            res.send(newBlock);
        }
    });

    // Mine a block with transaction
    app.post('/mineTransaction', async (req: Request, res: Response) => {
        const { address, amount } = req.body;

        if (!address || amount == null) {
            res.status(400).send('address or amount missing');
            return;
        }

        try {
            const newBlock = await generatenextBlockWithTransaction(address, amount);
            res.send(newBlock);
        } catch (e: any) {
            res.status(400).send(e.message);
        }
    });

     app.post('/sendTransaction', (req: Request, res: Response) => {
        try {
            const address = req.body.address;
            const amount = req.body.amount;

            if (address === undefined || amount === undefined) {
                throw Error('invalid address or amount');
            }
            const resp = sendTransaction(address, amount);
            res.send(resp);
        } catch (e: any) {
            console.log(e.message);
            res.status(400).send(e.message);
        }
    });

    app.get('/transactionPool', (req: Request, res: Response) => {
        res.send(getTransactionPool());
    });

    // Get balance
    app.get('/balance', (req: Request, res: Response) => {
        const balance: number = getAccountBalance();
        res.send({ balance });
    });

    app.get('/address', (req, res) => {
        const address: string = getPublicFromWallet();
        res.send({'address': address});
    });

    // List peers
    app.get('/peers', (req: Request, res: Response) => {
        res.send(
            getSockets().map(
                (s: any) => `${s._socket.remoteAddress}:${s._socket.remotePort}`
            )
        );
    });

    // Add a new peer
    app.post('/addPeer', (req: Request, res: Response) => {
        const peer = req.body.peer;
        if (!peer) {
            res.status(400).send('peer parameter missing');
            return;
        }
        connectToPeers(peer);
        res.send();
    });
    app.post('/stop', (req, res) => {
        res.send({'msg' : 'stopping server'});
        process.exit();
    });

    // Start HTTP server
    app.listen(myHttpPort, () => {
        console.log(`Listening HTTP on port: ${myHttpPort}`);
    });
};

// Initialize servers and wallet
const startServer = async () => {
    try {
        await connectDB();
        await loadBlockchain();

        initWallet();
        initHttpServer(httpPort);
        initP2PServer(p2pPort);

        console.log("🚀 Xypher node running");
    } catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
    }
};

startServer();
