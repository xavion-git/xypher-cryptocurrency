import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,  // ← ADD THIS - provides *ngIf, *ngFor, async pipe, date pipe
    DashboardRoutingModule
  ]
})
export class DashboardModule { }