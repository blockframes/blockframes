import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Route } from '@angular/router';
import { FestivalComponent } from './festival.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

const children: Route[] = []

@NgModule({
  declarations: [FestivalComponent],
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    RouterModule.forChild([{ path: '', component: FestivalComponent }])
  ]
})
export class FestivalModule {}