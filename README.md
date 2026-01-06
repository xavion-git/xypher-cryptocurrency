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