import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    // Services are provided at root level via @Injectable({ providedIn: 'root' })
    // so we don't need to add them here
  ]
})
export class CoreModule { }