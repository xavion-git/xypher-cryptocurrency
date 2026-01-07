# Xypher-Cryptocurrency
Xypher is a fast, secure, and decentralized cryptocurrency built for seamless transactions and real-world use, giving users full control in the Web3 economy.

## File Structure 
```
XYPHER-CRYPTOCURRENCY/
 ├── img/
 ├── node_modules/
 ├── src/
 │   ├── blockchain.ts
 │   ├── main.ts
 │   └── p2p.ts
 │
 ├── .gitignore
 ├── package-lock.json
 ├── package.json
 ├── README.md
 ├── tsconfig.json
 └── tslint.json
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