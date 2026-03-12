<div align="center">

# ⛓ XYPHER

### A Fast, Secure & Decentralized Cryptocurrency — Built From Scratch

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Angular](https://img.shields.io/badge/Angular-17.x-DD0031?style=flat-square&logo=angular&logoColor=white)](https://angular.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)

Xypher is a full-stack blockchain implementation demonstrating core Web3 architecture — from cryptographic hashing and Proof-of-Work mining to peer-to-peer synchronization and a real-time Angular dashboard.

![Xypher Dashboard](<./xypher-backend/img/xypher-titanium.svg>)

</div>

---

##  Features

- **Custom Blockchain** — Block creation, validation, and chain integrity built in pure TypeScript
- **Proof-of-Work Mining** — Adjustable difficulty with nonce-based puzzle solving
- **P2P Networking** — Real-time node synchronization over WebSockets
- **Transaction System** — ECDSA-signed transactions with mempool management
- **Wallet System** — Public/private key generation with full balance tracking
- **REST API** — External access to blockchain data and node controls
- **Angular Dashboard** — Live blockchain explorer, wallet UI, and peer network monitor

---

## 🏗 Architecture

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

##  File Structure

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
├── dist/                    # Compiled JavaScript output
├── img/                     # Screenshots & diagrams
├── package.json
├── tsconfig.json
└── README.md
```

---

##  Getting Started

### Prerequisites

- Node.js `v20+`
- npm `v9+`
- MongoDB running locally (or a connection URI)

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Project

```bash
npm run build
```

### 3. Start a Node

```bash
npm start
```

### 4. Start Multiple Nodes *(Optional)*

Simulate a real peer network by launching nodes on different ports:

```bash
# Terminal 1 (default)
npm start

# Terminal 2
HTTP_PORT=3002 P2P_PORT=6002 npm start

# Terminal 3
HTTP_PORT=3003 P2P_PORT=6003 PEERS=ws://localhost:6001 npm start
```

### 5. Launch the Angular Dashboard

```bash
cd xypher-ui
npm install
ng serve
```

Open `http://localhost:4200` in your browser.

---

## 🔌 API Reference

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

## ⛓ How It Works

### Block Structure

Each block contains the minimum set of properties needed to form a tamper-evident chain:

| Property | Description |
|----------|-------------|
| `index` | The block's height in the chain |
| `timestamp` | Unix timestamp of block creation |
| `data` | Transaction data included in the block |
| `hash` | SHA-256 hash of all block contents |
| `previousHash` | Hash of the preceding block |

![Block Structure](./xypher-backend/img/Screenshot%202026-01-05%20170359.png)

### Block Hashing

The hash is computed over **all** block data — index, timestamp, data, previousHash, and nonce. Any modification to a block's contents produces a completely different hash, instantly invalidating the chain from that point forward. This is what makes the blockchain tamper-evident.

![Block Hash](./xypher-backend/img/Screenshot%202026-01-05%20171818.png)

### Node Communication

Each node maintains consensus by following these synchronization rules:

1. **New block mined** → broadcast to all connected peers
2. **New peer connects** → request the peer's latest block
3. **Received block is ahead** → append it or request the full chain to resolve discrepancies

![Node Communication](./xypher-backend/img/Screenshot%202026-01-05%20172831.png)

### Proof-of-Work

Mining requires finding a block hash with a specific number of **leading zero bits**, as defined by the current `difficulty`. Since SHA-256 is deterministic, the only way to change the hash output is to change the input — which is done by incrementing the `nonce`.

> Mining = repeatedly hashing `(blockData + nonce)` until the result satisfies the difficulty target.

This makes block creation computationally expensive and tamper-resistant, while validation remains instant.

![Proof of Work](./xypher-backend/img/Screenshot%202026-01-06%20192710.png)

### Full Architecture Diagram

![Architecture](./xypher-backend/img/ab88cdcc-1497-4daf-ad16-e89b632dc913.png)

---

## 🛠 Tech Stack

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

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please ensure your code follows the existing TypeScript conventions and includes relevant tests where applicable.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

<div align="center">

Built with by the Xypher team

</div>