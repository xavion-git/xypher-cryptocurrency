# Xypher Cryptocurrency
Xypher is a from-scratch cryptocurrency implementation written in TypeScript, inspired by Bitcoin’s core design. It demonstrates how blockchains, proof-of-work, peer-to-peer networking, wallets, and cryptographically secure transactions work together in a decentralized system.

## Features
- ⛓️ **Blockchain** with Proof of Work (SHA-256)
- 🔐 **ECDSA** public-key cryptography for transactions
- 💸 **UTXO** (Unspent Transaction Output) transaction model
- 🧾 **Transaction validation** & digital signatures
- 🪙 Coinbase transactions & mining rewards
- 🌐 **Peer-to-peer** (P2P) node communication
- 👛 **Wallet** system using private/public keys
- ⚙️ **REST API** for interacting with the node

## 🧠 How Xypher Works (High Level)

**1. Blockchain**
- Each block contains:
    - A list of transactions
    - A hash of the previous block
    - A nonce used for mining
- Blocks are mined using Proof of Work, where the hash must meet a difficulty target

**2. Transactions (UTXO Model)**
- Transactions consist of:
    - Inputs (TxIn) → reference unspent outputs
    - Outputs (TxOut) → lock coins to public keys
- Inputs unlock coins using ECDSA signatures
- Outputs re-lock coins to a new owner’s public key

**3. Security**
- Private keys are never shared or stored on-chain
- Only public keys and signatures appear in the blockchain
- Any change to a transaction invalidates its signature

**4. Mining & Coinbase Transactions**
- Miners create blocks and receive a coinbase reward
- Coinbase transactions:
    - Have no real inputs
    - Mint new coins into circulation
    - Are unique per block using the block height

**5. P2P Network** 
- Nodes communicate over WebSockets
- Blocks and transactions are broadcast and validated
- Invalid chains or transactions are rejected

## 📂 Project Structure
```
XYPHER-CRYPTOCURRENCY/Backend/
├── src/
│ ├── blockchain.ts         # Block & chain logic
│ ├── p2p.ts                # Peer-to-peer networking
│ ├── transaction.ts        # Transactions & validation
│ ├── transactionPool.ts    # Mempool handling
│ ├── wallet.ts             # Wallet & key management
│ ├── util.ts               # Hashing & helpers
│ └── main.ts               # App entry point
│
├── dist/                   # Compiled JavaScript output
├── img/                    # Screenshots & diagrams
├── package.json
├── tsconfig.json
├── tslint.json
└── README.md
```

## Tech Stack 
- TypeScript – type-safe backend development
- Node.js – runtime
- CryptoJS – SHA-256 hashing
- elliptic – ECDSA public-key cryptography
- WebSocket (ws) – peer-to-peer networking
- Express – REST API

## ▶️ Getting Started
### 1. Install Dependencies
``` bash
npm install
```
### 2. Build the Project 
``` bash
npm run build
```
### 3. start a Node 
``` bash
npm start
```
### 4.(Optional) Start Multiple Nodes
``` bash
HTTP_PORT=3002 P2P_PORT=6002 npm start
```

## Blockchain 

The structure only include the most essential properties.
- index : The height of the block in the blockchain
- data: Any data that is included in the block.
- timestamp: A timestamp
- hash: A sha256 hash taken from the content of the block
- previousHash: A reference to the hash of the previous block. This value explicitly defines the previous block.

![pop-up](./img/Screenshot%202026-01-05%20170359.png)

### Block Hash

One of the most critical parts of a cryptocurrency is **hashing**. In this project the hash is calculated over all data of the block. which means if anything in the block changes the original hash is no longer valid.

The block hash can also be though of as a unique identifier. For Example if the blocks with the same index can happen, but they all have unique hashes.

![pop-up](./img/Screenshot%202026-01-05%20171818.png)

## Node Communication
An essential responsibility of each node is to share and synchronize the blockchain with other nodes in the network. To maintain consistency across the network, the following rules are applied:
- When a node creates a new block, it broadcasts the block to all connected peers.
- When a node connects to a new peer, it requests the peer’s latest block.
- If a node receives a block with an index higher than its current latest block, it either appends the block to its chain or requests the full blockchain to resolve any discrepancies.

![pop-up](./img/Screenshot%202026-01-05%20172831.png)

### Proof of Work Puzzle
So far in the project we have made a simiple toy block chain that could add a block without cost. `Proof-of-work`can add some complexities before the block is added to the blockchain. In which solving this puzzle is known as **mining**.
#### Difficulty/Nonce
To understand why we need difficulty and nonce we will look at what the `Proof-of-work` puzzle is doing.

To simplify the `Proof-of-work` puzzle is to find a block hash hat has a specific number of zeros prefixing it. 

The **difficulty** property defines the number of zeros prefixing the block hash needs. In order for the block to be validated the zeros are checked from binary of the hash. 

![pop-up](./img/Screenshot%202026-01-06%20192710.png)

To produce a hash that meets the difficulty requirement, we need a way to generate many different hashes from the same block data. This is achieved by changing the nonce value. Since SHA-256 is a cryptographic hash function, even a small change to the block’s contents results in a completely different hash. Mining is essentially the process of repeatedly adjusting the nonce and recalculating the hash until one is found that satisfies the difficulty target.

## Transaction Signature(UTXO Model)

### 1. Outputs & Inputs 
Transaction used in cryptocurrency are typically based on the thought of UTXO model in which an output is given that unlocks amount in the target account(wallet) and the input(locks) amount. When giving a transaction the aomunt in the account is unlocked(output) then locked to the recepent(input) then unlocked ready for another transaction. 

### 2. Transaction IDs

When sending transactions a transactionID is given to prevent tampering allowing for better security. 
 - Example: if  `AAA` was sending a transaction to `BBB` attackers could intersept 



![pop-up](./img/ab88cdcc-1497-4daf-ad16-e89b632dc913.png)

