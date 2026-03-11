import { Component, OnInit } from '@angular/core';
import { BlockchainService } from '../../core/services/blockchain.service';
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

  constructor(private blockchainService: BlockchainService) {
    this.transactionPool$ = this.blockchainService.transactionPool$;
  }

  ngOnInit(): void {
    this.blockchainService.loadTransactionPool();
  }

  startMining(): void {
    this.mining = true;
    this.miningResult = null;

    this.blockchainService.mineBlock().subscribe({
      next: (block) => {
        this.mining = false;
        this.miningResult = `Block #${block.index} mined successfully! You earned 50 coins.`;
      },
      error: (err) => {
        this.mining = false;
        this.miningResult = `Mining failed: ${err.error || 'Unknown error'}`;
      }
    });
  }
}