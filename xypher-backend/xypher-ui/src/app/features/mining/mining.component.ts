import { Component, OnInit } from '@angular/core';
import { BlockchainService } from '../../core/services/blockchain.service';
import { WalletService } from '../../core/services/wallet.service';
import { Observable } from 'rxjs';
import { Transaction } from '../../core/models/block.model';

@Component({
  selector: 'app-mining',
  standalone: false,
  templateUrl: './mining.component.html',
  styleUrls: ['./mining.component.scss']
})
export class MiningComponent implements OnInit {
  transactionPool$: Observable<Transaction[]>;
  mining = false;
  miningResult: string | null = null;
  miningError = false;

  constructor(
    private blockchainService: BlockchainService,
    private walletService: WalletService
  ) {
    this.transactionPool$ = this.blockchainService.transactionPool$;
  }

  ngOnInit(): void {
    this.blockchainService.loadTransactionPool();
  }

  startMining(): void {
    this.mining = true;
    this.miningResult = null;
    this.miningError = false;

    this.blockchainService.mineBlock().subscribe({
      next: (block) => {
        this.mining = false;
        this.miningError = false;
        this.miningResult = `✅ Block #${block.index} mined! You earned 50 XYP + fees.`;
        this.walletService.loadWalletData(); // refresh balance
      },
      error: (err) => {
        this.mining = false;
        this.miningError = true;
        this.miningResult = `❌ Mining failed: ${err.message || 'Unknown error'}`;
      }
    });
  }
}
