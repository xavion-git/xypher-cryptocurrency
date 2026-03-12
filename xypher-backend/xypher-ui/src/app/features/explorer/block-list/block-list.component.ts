import { Component, OnInit } from '@angular/core';
import { BlockchainService } from '../../../core/services/blockchain.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Block } from '../../../core/models/block.model';

@Component({
  selector: 'app-block-list',
  standalone: false,
  templateUrl: './block-list.component.html',
  styleUrls: ['./block-list.component.scss']
})
export class BlockListComponent implements OnInit {
  blocks$: Observable<Block[]>;
  searchTerm = '';

  constructor(private blockchainService: BlockchainService) {
    // Show newest blocks first
    this.blocks$ = this.blockchainService.blocks$.pipe(
      map(blocks => [...blocks].reverse())
    );
  }

  ngOnInit(): void {
    this.blockchainService.loadBlockchain();
  }

  get filteredBlocks$(): Observable<Block[]> {
    return this.blocks$.pipe(
      map(blocks => {
        if (!this.searchTerm.trim()) return blocks;
        const term = this.searchTerm.toLowerCase();
        return blocks.filter(b =>
          b.hash.includes(term) ||
          b.previousHash.includes(term) ||
          b.index.toString() === term
        );
      })
    );
  }
}
