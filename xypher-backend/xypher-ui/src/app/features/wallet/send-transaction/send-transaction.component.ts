import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BlockchainService } from '../../../core/services/blockchain.service';
import { WalletService } from '../../../core/services/wallet.service';

@Component({
  selector: 'app-send-transaction',
  standalone: false,
  templateUrl: './send-transaction.component.html',
  styleUrls: ['./send-transaction.component.scss']
})
export class SendTransactionComponent {
  recipientAddress = new FormControl('', [
    Validators.required,
    Validators.minLength(130),
    Validators.maxLength(130),
    Validators.pattern('^[a-fA-F0-9]+$')
  ]);
  amount = new FormControl<number | null>(null, [Validators.required, Validators.min(1)]);
  mineImmediately = new FormControl(false);

  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private blockchainService: BlockchainService,
    private walletService: WalletService
  ) {}

  onSubmit(): void {
    if (this.recipientAddress.invalid || this.amount.invalid) {
      this.recipientAddress.markAsTouched();
      this.amount.markAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    const address = this.recipientAddress.value!;
    const amt = Number(this.amount.value);

    if (this.mineImmediately.value) {
      this.blockchainService.mineTransaction(address, amt).subscribe({
        next: (block) => {
          this.success = `✅ Transaction mined in block #${block.index}`;
          this.loading = false;
          this.resetForm();
          this.walletService.loadWalletData();
        },
        error: (err) => {
          this.error = `❌ ${err.message || 'Failed to mine transaction'}`;
          this.loading = false;
        }
      });
    } else {
      this.blockchainService.sendTransaction(address, amt).subscribe({
        next: (tx) => {
          this.success = `✅ Transaction added to pool: ${tx.id.substring(0, 20)}...`;
          this.loading = false;
          this.resetForm();
        },
        error: (err) => {
          this.error = `❌ ${err.message || 'Failed to send transaction'}`;
          this.loading = false;
        }
      });
    }
  }

  private resetForm(): void {
    this.recipientAddress.reset('');
    this.amount.reset(null);
    this.mineImmediately.reset(false);
  }
}
