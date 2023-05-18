// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Pages
import { AvailsComponent } from './avails.component';

@NgModule({
  declarations: [AvailsComponent],
  imports: [
    CommonModule,

    // Material

    // Routing
    RouterModule.forChild([{ path: '', component: AvailsComponent }]),
  ],
})
export class AvailsModule { }
