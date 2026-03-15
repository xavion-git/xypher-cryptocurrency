import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';

import { DashboardModule } from './features/dashboard/dashboard.module';
import { WalletModule } from './features/wallet/wallet.module';
import { ExplorerModule } from './features/explorer/explorer.module';
import { MiningModule } from './features/mining/mining.module';
import { NetworkModule } from './features/network/network.module';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    AppComponent,
    DashboardModule,
    WalletModule,
    ExplorerModule,
    MiningModule,
    NetworkModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }