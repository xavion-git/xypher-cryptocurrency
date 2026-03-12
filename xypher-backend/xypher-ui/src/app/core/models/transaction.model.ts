export interface TxIn {
  txOutId: string;
  txOutIndex: number;
  signature: string;
}

export interface TxOut {
  address: string;
  amount: number;
}

export interface Transaction {
  id: string;
  txIns: TxIn[];
  txOuts: TxOut[];
}

export interface UnspentTxOut {
  txOutId: string;
  txOutIndex: number;
  address: string;
  amount: number;
}