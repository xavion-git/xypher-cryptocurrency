import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BlockchainService } from '../../../core/services/blockchain.service';

@Component({
  selector: 'app-send-transaction',
  standalone: false,
  templateUrl: './send-transaction.component.html',
  styleUrls: ['./send-transaction.component.scss']
})
export class SendTransactionComponent {
  sendForm: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private blockchainService: BlockchainService
  ) {
    this.sendForm = this.fb.group({
      recipientAddress: ['', [Validators.required, Validators.minLength(130), Validators.maxLength(130)]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      mineImmediately: [false]
    });
  }

  onSubmit(): void {
    if (this.sendForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    const { recipientAddress, amount, mineImmediately } = this.sendForm.value;

    if (mineImmediately) {
      // Mine transaction immediately
      this.blockchainService.mineTransaction(recipientAddress, amount).subscribe({
        next: (block) => {
          this.success = `Transaction mined in block #${block.index}`;
          this.loading = false;
          this.sendForm.reset();
        },
        error: (err) => {
          this.error = err.error || 'Failed to mine transaction';
          this.loading = false;
        }
      });
    } else {
      // Send to transaction pool
      this.blockchainService.sendTransaction(recipientAddress, amount).subscribe({
        next: (tx) => {
          this.success = `Transaction added to pool: ${tx.id.substring(0, 16)}...`;
          this.loading = false;
          this.sendForm.reset();
        },
        error: (err) => {
          this.error = err.error || 'Failed to send transaction';
          this.loading = false;
        }
      });
    }
  }
}