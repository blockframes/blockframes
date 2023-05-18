// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Pages
import { ChartsComponent } from './charts.component';

@NgModule({
  declarations: [ChartsComponent],
  imports: [
    CommonModule,

    // Material

    // Routing
    RouterModule.forChild([{ path: '', component: ChartsComponent }]),
  ],
})
export class ChartsModule { }
