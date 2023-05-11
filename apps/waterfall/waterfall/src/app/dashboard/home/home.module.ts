// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImageModule } from '@blockframes/media/image/directives/image.module';

import { MatButtonModule } from '@angular/material/button';

// Pages
import { HomeComponent } from './home.component';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    ImageModule,

    // Material
    MatButtonModule,

    // Routing
    RouterModule.forChild([{ path: '', component: HomeComponent }])
  ]
})
export class HomeModule { }
