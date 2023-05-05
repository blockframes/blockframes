// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForModule } from '@rx-angular/template/for';
import { IfModule } from '@rx-angular/template/if';

// Pages
import { TableComponent } from './table.component';


@NgModule({
  declarations: [TableComponent],
  imports: [
    CommonModule,
    ForModule,
    IfModule,

    // Routing
    RouterModule.forChild([{ path: '', component: TableComponent }])
  ]
})
export class TableModule { }
