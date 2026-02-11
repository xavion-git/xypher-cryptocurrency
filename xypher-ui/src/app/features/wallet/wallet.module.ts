// src/app/features/wallet/wallet.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { WalletRoutingModule } from './wallet-routing.module';
import { WalletComponent } from './wallet.component';
import { WalletBalanceComponent } from './wallet-balance/wallet-balance.component';
import { SendTransactionComponent } from './send-transaction/send-transaction.component';

@NgModule({
  declarations: [
    WalletComponent,
    WalletBalanceComponent,
    SendTransactionComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    WalletRoutingModule
  ]
})
export class WalletModule { }