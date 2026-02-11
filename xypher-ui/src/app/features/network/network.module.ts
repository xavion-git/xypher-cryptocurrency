// src/app/features/network/network.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkRoutingModule } from './network-routing.module';
import { NetworkComponent } from './network.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    NetworkComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NetworkRoutingModule
  ]
})
export class NetworkModule { }