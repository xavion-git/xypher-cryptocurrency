import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlockchainService } from '../../../core/services/blockchain.service';
import { Block } from '../../../core/models/block.model';

@Component({
  selector: 'app-block-detail',
  standalone: false,
  templateUrl: './block-detail.component.html',
  styleUrls: ['./block-detail.component.scss']
})
export class BlockDetailComponent implements OnInit {
  block: Block | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private blockchainService: BlockchainService
  ) {}

  ngOnInit(): void {
    const hash = this.route.snapshot.paramMap.get('hash');
    if (hash) {
      this.blockchainService.getBlock(hash).subscribe({
        next: (block) => {
          this.block = block;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }
}