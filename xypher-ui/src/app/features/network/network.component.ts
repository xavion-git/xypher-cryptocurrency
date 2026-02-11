import { Component, OnInit } from '@angular/core';
import { BlockchainService } from '../../core/services/blockchain.service';

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.scss']
})
export class NetworkComponent implements OnInit {
  peers: string[] = [];
  newPeerAddress = '';
  loading = false;

  constructor(private blockchainService: BlockchainService) {}

  ngOnInit(): void {
    this.loadPeers();
  }

  loadPeers(): void {
    this.loading = true;
    this.blockchainService.getPeers().subscribe({
      next: (peers) => {
        this.peers = peers;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  addPeer(): void {
    if (this.newPeerAddress) {
      this.blockchainService.addPeer(this.newPeerAddress).subscribe({
        next: () => {
          this.newPeerAddress = '';
          this.loadPeers();
        },
        error: (err) => {
          alert('Failed to add peer: ' + (err.error || 'Unknown error'));
        }
      });
    }
  }
}