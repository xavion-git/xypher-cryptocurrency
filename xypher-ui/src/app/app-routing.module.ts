import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule) 
  },
  { 
    path: 'wallet', 
    loadChildren: () => import('./features/wallet/wallet.module').then(m => m.WalletModule) 
  },
  { 
    path: 'explorer', 
    loadChildren: () => import('./features/explorer/explorer.module').then(m => m.ExplorerModule) 
  },
  { 
    path: 'mining', 
    loadChildren: () => import('./features/mining/mining.module').then(m => m.MiningModule) 
  },
  { 
    path: 'network', 
    loadChildren: () => import('./features/network/network.module').then(m => m.NetworkModule) 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }