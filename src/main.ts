import * as  bodyParser from 'body-parser';
import express, { NextFunction } from 'express';
import { Request, Response } from 'express';

import {Block, generateNextBlock, getBlockchain} from './blockchain';
import {connectToPeers, getSockets, initP2PServer} from './p2p';

const httpPort: number = parseInt(process.env.HTTP_PORT ?? '3001', 10);
const p2pPort: number = parseInt(process.env.P2P_PORT ?? '6001', 10);

const initHttpServer = (myHttpPort: number) => {
    const app = express();
    app.use(bodyParser.json());

    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        if (err) {
            res.status(400).send(err.message)
        }
    });

    app.get('/blocks', (req: Request, res: Response) => {
        res.send(getBlockchain());
    });
    app.post('/mineBlock', (req: Request, res: Response) => {
        const newBlock: Block | null = generateNextBlock(req.body.data);
        if (newBlock === null) {
            res.status(400).send('could not generate block');
        } else {
            res.send(newBlock);
        }
    });
    app.get('/peers', (req: Request, res: Response) => {
        res.send(getSockets().map((s: any) => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.post('/addPeer', (req: Request, res: Response) => {
        connectToPeers(req.body.peer);
        res.send();
    });

    app.listen(myHttpPort, () => {
        console.log('Listening http on port: ' + myHttpPort);
    });
};

initHttpServer(httpPort);
initP2PServer(p2pPort);