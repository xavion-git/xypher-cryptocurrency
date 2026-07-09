import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { BlockchainService } from '../../core/services/blockchain.service';
import { WalletService } from '../../core/services/wallet.service';
import { Observable } from 'rxjs';
import { Block, Transaction } from '../../core/models/block.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('mainChart') mainChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('hashRateChart') hashRateChartRef!: ElementRef<HTMLCanvasElement>;

  blocks$: Observable<Block[]>;
  balance$: Observable<number>;
  address$: Observable<string>;
  transactionPool$: Observable<Transaction[]>;

  latestBlocks: Block[] = [];
  networkStats = {
    totalBlocks: 0,
    difficulty: 0,
    pendingTransactions: 0
  };

  constructor(
    private blockchainService: BlockchainService,
    private walletService: WalletService
  ) {
    this.blocks$ = this.blockchainService.blocks$;
    this.balance$ = this.walletService.balance$;
    this.address$ = this.walletService.address$;
    this.transactionPool$ = this.blockchainService.transactionPool$;
  }

  ngOnInit(): void {
    this.loadData();

    this.blocks$.subscribe(blocks => {
      this.latestBlocks = blocks.slice(-5).reverse();
      this.networkStats.totalBlocks = blocks.length;
      this.networkStats.difficulty = blocks[blocks.length - 1]?.difficulty || 0;
    });

    this.transactionPool$.subscribe(pool => {
      this.networkStats.pendingTransactions = pool.length;
    });
  }

  ngAfterViewInit(): void {
    this.createMainChart();
    this.createHashRateChart();
  }

  loadData(): void {
    this.blockchainService.loadBlockchain();
    this.blockchainService.loadTransactionPool();
    this.walletService.loadWalletData();
  }

  refresh(): void {
    this.loadData();
  }

  private createMainChart(): void {
    if (!this.mainChartRef) return;

    new Chart(this.mainChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
        datasets: [
          {
            label: 'Transactions',
            data: [12, 25, 40, 30, 15, 22, 38],
            borderColor: '#4361ee',
            backgroundColor: 'rgba(67, 97, 238, 0.08)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 2
          },
          {
            label: 'Blocks',
            data: [5, 15, 35, 20, 8, 5, 30],
            borderColor: '#16a34a',
            backgroundColor: 'rgba(22, 163, 74, 0.06)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false } },
          y: { display: false }
        }
      }
    });
  }

  private createHashRateChart(): void {
    if (!this.hashRateChartRef) return;

    new Chart(this.hashRateChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['', '', '', '', '', '', ''],
        datasets: [{
          data: [40, 55, 45, 70, 60, 50, 65],
          borderColor: '#4361ee',
          backgroundColor: 'rgba(67, 97, 238, 0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });
  }
}