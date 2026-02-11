import { Component, OnInit } from '@angular/core';
import { BlockchainService } from '../../core/services/blockchain.service';
import { WalletService } from '../../core/services/wallet.service';
import { Observable } from 'rxjs';
import { Block, Transaction } from '../../core/models/block.model';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  blocks$: Observable<Block[]>;
  balance$: Observable<number>;
  address$: Observable<string>;
  transactionPool$: Observable<Transaction[]>;
  
  latestBlocks: Block[] = [];
  networkStats = {
    totalBlocks: 0,
    difficulty: 0,
    pendingTransactions: 0
  };

  constructor(
    private blockchainService: BlockchainService,
    private walletService: WalletService
  ) {
    this.blocks$ = this.blockchainService.blocks$;
    this.balance$ = this.walletService.balance$;
    this.address$ = this.walletService.address$;
    this.transactionPool$ = this.blockchainService.transactionPool$;
  }

  ngOnInit(): void {
    this.loadData();
    
    // Subscribe to blocks for stats
    this.blocks$.subscribe(blocks => {
      this.latestBlocks = blocks.slice(-5).reverse();
      this.networkStats.totalBlocks = blocks.length;
      this.networkStats.difficulty = blocks[blocks.length - 1]?.difficulty || 0;
    });
    
    this.transactionPool$.subscribe(pool => {
      this.networkStats.pendingTransactions = pool.length;
    });
  }

  loadData(): void {
    this.blockchainService.loadBlockchain();
    this.blockchainService.loadTransactionPool();
    this.walletService.loadWalletData();
  }

  refresh(): void {
    this.loadData();
  }
}