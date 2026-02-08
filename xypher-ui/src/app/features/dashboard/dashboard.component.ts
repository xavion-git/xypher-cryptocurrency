import { Component, OnInit } from '@angular/core';
import { BlockchainService } from '../../core/services/blockchain.service';
import { WalletService } from '../../core/services/wallet.service';
import { Observable } from 'rxjs';
import { Block, Transaction } from '../../core/models/block.model';