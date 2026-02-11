import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlockchainService } from '../../../core/services/blockchain.service';
import { Transaction } from '../../../core/models/block.model';

@Component({
  selector: 'app-transaction-detail',
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.scss']
})
export class TransactionDetailComponent implements OnInit {
  transaction: Transaction | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private blockchainService: BlockchainService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.blockchainService.getTransaction(id).subscribe({
        next: (tx) => {
          this.transaction = tx;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }
}