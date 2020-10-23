// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Pages
import { NoTitleComponent } from './no-title.component';

@NgModule({
  declarations: [NoTitleComponent],
  imports: [CommonModule],
  exports: [NoTitleComponent]
})
export class NoTitleModule { }
