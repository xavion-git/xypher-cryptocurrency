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
    
}