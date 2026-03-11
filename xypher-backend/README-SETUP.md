# Xypher Backend Setup

## Prerequisites
- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)

## Setup

1. Install dependencies:
```
npm install
```

2. Create your environment file:
```
cp .env.example .env
```

3. Edit `.env` with your settings (MongoDB URI, ports etc.)

4. Start the server:
```
npm start
```
Or for development (no compile step):
```
npm run start:dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /blocks | Full blockchain |
| GET | /block/:hash | Single block |
| GET | /balance | Your wallet balance |
| GET | /address | Your wallet address |
| GET | /transactionPool | Pending transactions |
| GET | /peers | Connected peers |
| POST | /mineBlock | Mine a new block |
| POST | /sendTransaction | Send coins (body: {address, amount}) |
| POST | /mineTransaction | Send + mine in one step |
| POST | /addPeer | Connect to peer (body: {peer: "ws://..."}) |

## Notes
- Your private key is stored in `node/wallet/private_key` — never commit this file
- First run will auto-generate a new wallet
- MongoDB must be running before starting the node
