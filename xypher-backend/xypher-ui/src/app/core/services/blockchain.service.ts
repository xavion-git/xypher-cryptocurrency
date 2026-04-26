import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Block, Transaction, UnspentTxOut } from '../models/block.model';

@Injectable({ providedIn: 'root' })
export class BlockchainService {
  private apiUrl = 'https://xypher-backend.fly.dev';

  private blocksSubject = new BehaviorSubject<Block[]>([]);
  public blocks$ = this.blocksSubject.asObservable();

  private transactionPoolSubject = new BehaviorSubject<Transaction[]>([]);
  public transactionPool$ = this.transactionPoolSubject.asObservable();

  private onlineSubject = new BehaviorSubject<boolean>(false);
  public online$ = this.onlineSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadBlockchain();
    this.loadTransactionPool();
  }

  getBlockchain(): Observable<Block[]> {
    return this.http.get<Block[]>(`${this.apiUrl}/blocks`).pipe(
      tap(blocks => {
        this.blocksSubject.next(blocks);
        this.onlineSubject.next(true);
      }),
      catchError(err => {
        this.onlineSubject.next(false);
        return of([]);
      })
    );
  }

  loadBlockchain(): void { this.getBlockchain().subscribe(); }

  getBlock(hash: string): Observable<Block> {
    return this.http.get<Block>(`${this.apiUrl}/block/${hash}`);
  }

  getTransaction(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/transaction/${id}`);
  }

  getUnspentTxOuts(): Observable<UnspentTxOut[]> {
    return this.http.get<UnspentTxOut[]>(`${this.apiUrl}/unspentTransactionOutputs`);
  }

  getAddressUnspentTxOuts(address: string): Observable<{ unspentTxOuts: UnspentTxOut[] }> {
    return this.http.get<{ unspentTxOuts: UnspentTxOut[] }>(`${this.apiUrl}/address/${address}`);
  }

  mineBlock(): Observable<Block> {
    return this.http.post<Block>(`${this.apiUrl}/mineBlock`, {}).pipe(
      tap(() => {
        this.loadBlockchain();
        this.loadTransactionPool();
      })
    );
  }

  mineTransaction(address: string, amount: number): Observable<Block> {
    return this.http.post<Block>(`${this.apiUrl}/mineTransaction`, { address, amount }).pipe(
      tap(() => {
        this.loadBlockchain();
        this.loadTransactionPool();
      })
    );
  }

  sendTransaction(address: string, amount: number): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/sendTransaction`, { address, amount }).pipe(
      tap(() => this.loadTransactionPool())
    );
  }

  getTransactionPool(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactionPool`).pipe(
      tap(pool => this.transactionPoolSubject.next(pool)),
      catchError(() => of([]))
    );
  }

  loadTransactionPool(): void { this.getTransactionPool().subscribe(); }

  getPeers(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/peers`).pipe(
      catchError(() => of([]))
    );
  }

  addPeer(peer: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/addPeer`, { peer });
  }
}
