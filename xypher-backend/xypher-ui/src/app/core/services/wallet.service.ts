import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, of } from 'rxjs';
import { tap, switchMap, startWith, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private apiUrl = 'http://localhost:3001';

  private balanceSubject = new BehaviorSubject<number>(0);
  public balance$ = this.balanceSubject.asObservable();

  private addressSubject = new BehaviorSubject<string>('');
  public address$ = this.addressSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadWalletData();
    this.startBalancePolling();
  }

  getBalance(): Observable<{ balance: number }> {
    return this.http.get<{ balance: number }>(`${this.apiUrl}/balance`).pipe(
      tap(data => this.balanceSubject.next(data.balance)),
      catchError(() => of({ balance: 0 }))
    );
  }

  getAddress(): Observable<{ address: string }> {
    return this.http.get<{ address: string }>(`${this.apiUrl}/address`).pipe(
      tap(data => this.addressSubject.next(data.address)),
      catchError(() => of({ address: '' }))
    );
  }

  loadWalletData(): void {
    this.getBalance().subscribe();
    this.getAddress().subscribe();
  }

  private startBalancePolling(): void {
    interval(10000).pipe(
      startWith(0),
      switchMap(() => this.getBalance())
    ).subscribe();
  }
}
