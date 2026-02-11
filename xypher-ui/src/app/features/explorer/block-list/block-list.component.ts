import { Component, OnInit } from '@angular/core';
import { BlockchainService } from '../../../core/services/blockchain.service';
import { Observable } from 'rxjs';
import { Block } from '../../../core/models/block.model';

@Component({
  selector: 'app-block-list',
  templateUrl: './block-list.component.html',
  styleUrls: ['./block-list.component.scss']
})
export class BlockListComponent implements OnInit {
  blocks$: Observable<Block[]>;
  searchTerm = '';

  constructor(private blockchainService: BlockchainService) {
    this.blocks$ = this.blockchainService.blocks$;
  }

  ngOnInit(): void {
    this.blockchainService.loadBlockchain();
  }

  onSearch(): void {
    // Implement search functionality
    console.log('Searching for:', this.searchTerm);
  }
}