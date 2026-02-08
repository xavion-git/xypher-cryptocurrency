import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
import { tap }  from 'rxjs/operators';
import { Block, Transaction, UnspentTxOut } from "../models/block.model";

@Injectable({
    providedIn: 'root'
})
export class BlockchainService {
    private apiUrl = 'http://localhost:3001'; // Blockchain backend

    private blocksSubject = new BehaviorSubject<Block[]>([]);
    public blocks$ = 
        this.blocksSubject.asObservable();

    private transactionPoolSubject = new BehaviorSubject<Transaction[]>([]);
    public transactionPool$ = 
        this.transactionPoolSubject.asObservable();
    
    constructor(private http: HttpClient) {
        this.loadBlockchain();
        this.loadTransactionPool();
    }

    // Get Blockchain 
    getBlockchain(): Observable<Block[]> {
        return this.http.get<Block[]>(`${this.apiUrl}/blocks`).pipe(
            tap(blocks => this. blocksSubject.next(blocks))
        );
    }

    loadBlockchain(): void {
    this.getBlockchain().subscribe();
  }

  // Get specific block
  getBlock(hash: string): Observable<Block> {
    return this.http.get<Block>(`${this.apiUrl}/block/${hash}`);
  }

  // Get transaction
  getTransaction(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/transaction/${id}`);
  }

  // Get unspent outputs
  getUnspentTxOuts(): Observable<UnspentTxOut[]> {
    return this.http.get<UnspentTxOut[]>(`${this.apiUrl}/unspentTransactionOutputs`);
  }

  // Get unspent outputs for address
  getAddressUnspentTxOuts(address: string): Observable<{unspentTxOuts: UnspentTxOut[]}> {
    return this.http.get<{unspentTxOuts: UnspentTxOut[]}>(`${this.apiUrl}/address/${address}`);
  }

  // Mine new block
  mineBlock(): Observable<Block> {
    return this.http.post<Block>(`${this.apiUrl}/mineBlock`, {}).pipe(
      tap(() => this.loadBlockchain())
    );
  }

  // Mine block with transaction
  mineTransaction(address: string, amount: number): Observable<Block> {
    return this.http.post<Block>(`${this.apiUrl}/mineTransaction`, { address, amount }).pipe(
      tap(() => this.loadBlockchain())
    );
  }

  // Send transaction to pool
  sendTransaction(address: string, amount: number): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/sendTransaction`, { address, amount }).pipe(
      tap(() => this.loadTransactionPool())
    );
  }

  // Get transaction pool
  getTransactionPool(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactionPool`).pipe(
      tap(pool => this.transactionPoolSubject.next(pool))
    );
  }

  loadTransactionPool(): void {
    this.getTransactionPool().subscribe();
  }

  // Get peers
  getPeers(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/peers`);
  }

  // Add peer
  addPeer(peer: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/addPeer`, { peer });
  }
}