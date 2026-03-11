// src/app/features/explorer/explorer.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExplorerRoutingModule } from './explorer-routing.module';
import { ExplorerComponent } from './explorer.component';
import { BlockListComponent } from './block-list/block-list.component';
import { BlockDetailComponent } from './block-detail/block-detail.component';
import { TransactionDetailComponent } from './transaction-detail/transaction-detail.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ExplorerComponent,
    BlockListComponent,
    BlockDetailComponent,
    TransactionDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ExplorerRoutingModule
  ]
})
export class ExplorerModule { }