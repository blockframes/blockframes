import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TitleListComponent } from './list.component';

// Material
import { MatButtonModule } from '@angular/material';


@NgModule({
  declarations: [TitleListComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    RouterModule.forChild([{ path: '', component: TitleListComponent }])
  ]
})
export class TitleListModule {}
