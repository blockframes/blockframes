import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search.component';
import { RouterModule } from '@angular/router';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';



@NgModule({
  declarations: [SearchComponent],
  imports: [
    CommonModule,
    TableFilterModule,
    MatButtonModule,
    MatTabsModule,
    RouterModule.forChild([{ path: '', component: SearchComponent }])
  ]
})
export class SearchModule { }
