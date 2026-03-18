<div align="center">

# Xypher CryptoCurrency 

### A Fast, Secure & Decentralized Cryptocurrency — Built From Scratch

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Angular](https://img.shields.io/badge/Angular-17.x-DD0031?style=flat-square&logo=angular&logoColor=white)](https://angular.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)

Xypher is a full-stack blockchain implementation demonstrating core Web3 architecture — from cryptographic hashing and Proof-of-Work mining to peer-to-peer synchronization and a real-time Angular dashboard.

![Xypher Dashboard](<./xypher-backend/img/xypher-titanium.svg>)

</div>

---

## Features

- **Custom Blockchain** — Block creation, validation, and chain integrity built in pure TypeScript
- **Proof-of-Work Mining** — Adjustable difficulty with nonce-based puzzle solving
- **P2P Networking** — Real-time node synchronization over WebSockets
- **Transaction System** — ECDSA-signed transactions with mempool management
- **Wallet System** — Public/private key generation with full balance tracking
- **REST API** — External access to blockchain data and node controls
- **Angular Dashboard** — Live blockchain explorer, wallet UI, and peer network monitor
- **Dockerized** — Full stack containerized with Docker Compose, runs with a single command

---

## Architecture

Xypher is organized into five clean layers:

```
┌─────────────────────────────────────────────────────┐
│                   Frontend Layer                     │
│          Angular Dashboard  •  Blockchain Explorer   │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / WebSocket
┌──────────────────────▼──────────────────────────────┐
│                    API Layer                         │
│              Express REST  •  Node Control           │
└──────────┬───────────────────────────┬──────────────┘
           │                           │
┌──────────▼──────────┐   ┌────────────▼─────────────┐
│  Blockchain Layer   │   │      Network Layer        │
│  Block Creation     │   │  Peer Discovery           │
│  PoW Mining         │   │  Chain Synchronization    │
│  Chain Validation   │   │  Block Broadcasting       │
└──────────┬──────────┘   └────────────┬─────────────┘
           │                           │
┌──────────▼──────────┐   ┌────────────▼─────────────┐
│   Wallet Layer      │   │       Data Layer          │
│  Key Generation     │   │       MongoDB             │
│  TX Signing         │   │                           │
│  Balance Tracking   │   │                           │
└─────────────────────┘   └──────────────────────────┘
```

---

## File Structure

```
XYPHER-CRYPTOCURRENCY/
├── src/
│   ├── blockchain.ts        # Block & chain logic
│   ├── p2p.ts               # Peer-to-peer networking
│   ├── transaction.ts       # Transactions & validation
│   ├── transactionPool.ts   # Mempool handling
│   ├── wallet.ts            # Wallet & key management
│   ├── util.ts              # Hashing & helpers
│   └── main.ts              # App entry point
│
├── xypher-ui/               # Angular Frontend
│   └── src/app/
│       ├── core/
│       │   ├── services/    # blockchain, wallet, websocket
│       │   ├── models/      # block, transaction, wallet
│       │   └── interceptors/
│       ├── features/
│       │   ├── dashboard/
│       │   ├── wallet/      # balance & send-transaction
│       │   ├── explorer/    # block-list, block-detail, tx-detail
│       │   └── network/     # peer-list
│       └── shared/
│           ├── components/
│           └── pipes/
│
├── Dockerfile               # Multi-stage backend build
├── docker-compose.yml       # Full stack orchestration
├── dist/                    # Compiled JavaScript output
├── img/                     # Screenshots & diagrams
├── package.json
├── tsconfig.json
└── README.md
```

---

## Getting Started

### Option A — Docker (Recommended)

The fastest way to run Xypher. No need to install Node.js, MongoDB, or any dependencies manually.

**Prerequisites**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

**Run the full stack:**

```bash
docker compose up --build
```

That's it. Docker will:
1. Pull MongoDB and build the backend and frontend images
2. Start all three services in the correct order
3. Wire them together on a private network

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost:3001 |
| MongoDB | localhost:27017 |

**Stop everything:**
```bash
docker compose down
```

**Reset all data (wipe blockchain):**
```bash
docker compose down -v
```

---

### Option B — Manual Setup

**Prerequisites**

- Node.js `v20+`
- npm `v9+`
- MongoDB running locally (or a connection URI)

**1. Install Dependencies**

```bash
npm install
```

**2. Build the Project**

```bash
npm run build
```

**3. Start a Node**

```bash
npm start
```

**4. Start Multiple Nodes *(Optional)***

Simulate a real peer network by launching nodes on different ports:

```bash
# Terminal 1 (default)
npm start

# Terminal 2
HTTP_PORT=3002 P2P_PORT=6002 npm start

# Terminal 3
HTTP_PORT=3003 P2P_PORT=6003 PEERS=ws://localhost:6001 npm start
```

**5. Launch the Angular Dashboard**

```bash
cd xypher-ui
npm install
ng serve
```

Open `http://localhost:4200` in your browser.

---

## Docker — How It Works

Xypher uses a multi-stage Docker build and Docker Compose to run the full stack as isolated, reproducible containers.

### Container Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
│                   (xypher-network)                       │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐   │
│  │   mongo:6    │  │   backend    │  │   frontend    │   │
│  │              │  │              │  │               │   │
│  │  Port 27017  │  │  Port 3001   │  │   Port 80     │   │
│  │              │  │  Port 6001   │  │               │   │
│  └──────┬───────┘  └──────┬───────┘  └───────────────┘   │
│         │                 │                              │
│    mongo-data         wallet-data                        │
│    (volume)           (volume)                           │
└─────────────────────────────────────────────────────────┘
```

### Multi-Stage Dockerfile

The backend uses a two-stage build to keep the production image lean:

```
Stage 1 — Builder
  • Starts from node:22-alpine
  • Installs all dependencies (including devDependencies)
  • Compiles TypeScript → JavaScript

Stage 2 — Production
  • Starts fresh from node:22-alpine
  • Copies only the compiled dist/ folder from Stage 1
  • Installs production dependencies only
  • Final image is ~60% smaller than a single-stage build
```

### Service Startup Order

Docker Compose starts services in dependency order with health checks to ensure each service is fully ready before the next one starts:

```
1. mongo     → waits until mongosh ping succeeds
      ↓
2. backend   → waits until HTTP /blocks returns 200
      ↓
3. frontend  → waits until nginx responds on port 80
```

### Persistent Volumes

Data is preserved across container restarts via named volumes:

| Volume | Contains |
|--------|---------|
| `mongo-data` | Full blockchain stored in MongoDB |
| `wallet-data` | Node's private key |
| `blockchain-data` | Additional node data |

### Environment Variables

The backend container accepts these environment variables to configure the node:

| Variable | Default | Description |
|----------|---------|-------------|
| `HTTP_PORT` | `3001` | REST API port |
| `P2P_PORT` | `6001` | WebSocket P2P port |
| `MONGO_URI` | `mongodb://mongo:27017/xypher` | MongoDB connection string |
| `NODE_ENV` | `production` | Environment mode |
| `PEERS` | — | Comma-separated list of peer WebSocket URLs to connect to on startup |

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/blocks` | Retrieve the full blockchain |
| `POST` | `/mineBlock` | Mine a new block |
| `POST` | `/sendTransaction` | Create and broadcast a transaction |
| `GET` | `/transactionPool` | View pending transactions in the mempool |
| `GET` | `/peers` | List all connected peers |
| `POST` | `/addPeer` | Connect to a new peer node |
| `GET` | `/wallet/balance` | Get the current node's wallet balance |

---

## How It Works

### Block Structure

Each block contains the minimum set of properties needed to form a tamper-evident chain:

| Property | Description |
|----------|-------------|
| `index` | The block's height in the chain |
| `timestamp` | Unix timestamp of block creation |
| `data` | Transaction data included in the block |
| `hash` | SHA-256 hash of all block contents |
| `previousHash` | Hash of the preceding block |




### Block Hashing

The hash is computed over **all** block data — index, timestamp, data, previousHash, and nonce. Any modification to a block's contents produces a completely different hash, instantly invalidating the chain from that point forward. This is what makes the blockchain tamper-evident.

### Node Communication

Each node maintains consensus by following these synchronization rules:

1. **New block mined** → broadcast to all connected peers
2. **New peer connects** → request the peer's latest block
3. **Received block is ahead** → append it or request the full chain to resolve discrepancies

### Proof-of-Work

Mining requires finding a block hash with a specific number of **leading zero bits**, as defined by the current `difficulty`. Since SHA-256 is deterministic, the only way to change the hash output is to change the input — which is done by incrementing the `nonce`.

> Mining = repeatedly hashing `(blockData + nonce)` until the result satisfies the difficulty target.

This makes block creation computationally expensive and tamper-resistant, while validation remains instant.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Language | TypeScript | Type-safe backend development |
| Runtime | Node.js | JavaScript execution environment |
| API | Express | REST API server |
| Networking | `ws` (WebSocket) | Peer-to-peer node communication |
| Cryptography | `elliptic` | ECDSA public-key signing |
| Hashing | `CryptoJS` | SHA-256 block hashing |
| Database | MongoDB | Persistent blockchain storage |
| Frontend | Angular 17 | Real-time dashboard UI |
| Containerization | Docker + Compose | Reproducible deployment |
| CI/CD | GitHub Actions | Automated build and deploy pipeline |

---

## Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please ensure your code follows the existing TypeScript conventions and includes relevant tests where applicable.

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

<div align="center">

Built with ♦ by the Xypher team

</div>
