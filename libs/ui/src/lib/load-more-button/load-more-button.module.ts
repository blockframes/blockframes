// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

// Component
import { LoadMoreButtonComponent } from './load-more-button.component';

// Material
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  imports: [
    CommonModule,

    // Material
    MatProgressBarModule,
    MatButtonModule
  ],
  exports: [LoadMoreButtonComponent],
  declarations: [LoadMoreButtonComponent],
})
export class LoadMoreButtonModule { }
