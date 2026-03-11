// src/app/features/mining/mining.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MiningRoutingModule } from './mining-routing.module';
import { MiningComponent } from './mining.component';

@NgModule({
  declarations: [
    MiningComponent
  ],
  imports: [
    CommonModule,
    MiningRoutingModule
  ]
})
export class MiningModule { }