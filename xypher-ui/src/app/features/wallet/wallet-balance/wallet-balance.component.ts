import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../../core/services/wallet.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-wallet-balance',
  templateUrl: './wallet-balance.component.html',
  styleUrls: ['./wallet-balance.component.scss']
})
export class WalletBalanceComponent implements OnInit {
  balance$: Observable<number>;
  address$: Observable<string>;

  constructor(private walletService: WalletService) {
    this.balance$ = this.walletService.balance$;
    this.address$ = this.walletService.address$;
  }

  ngOnInit(): void {
    this.walletService.loadWalletData();
  }
}