import { Component, OnInit, OnDestroy } from '@angular/core';
import { BlockchainService } from '../../core/services/blockchain.service';
import { WalletService } from '../../core/services/wallet.service';
import { Observable, Subscription } from 'rxjs';
import { Block, Transaction } from '../../core/models/block.model';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  blocks$: Observable<Block[]>;
  balance$: Observable<number>;
  address$: Observable<string>;
  transactionPool$: Observable<Transaction[]>;
  offline = false;

  latestBlocks: Block[] = [];
  networkStats = { totalBlocks: 0, difficulty: 0, pendingTransactions: 0 };

  private subs = new Subscription();

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

    this.subs.add(this.blocks$.subscribe(blocks => {
      this.latestBlocks = [...blocks].reverse().slice(0, 5);
      this.networkStats.totalBlocks = blocks.length;
      this.networkStats.difficulty = blocks[blocks.length - 1]?.difficulty || 0;
    }));

    this.subs.add(this.transactionPool$.subscribe(pool => {
      this.networkStats.pendingTransactions = pool.length;
    }));

    this.subs.add(this.blockchainService.online$.subscribe(online => {
      this.offline = !online;
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadData(): void {
    this.blockchainService.loadBlockchain();
    this.blockchainService.loadTransactionPool();
    this.walletService.loadWalletData();
  }

  refresh(): void { this.loadData(); }
}
