// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Components
import { TitleImportComponent } from './import.component';

// Modules
import { ImportModule } from '@blockframes/import/import.module';

const routes = [{
  path: '',
  component: TitleImportComponent,
}];

@NgModule({
  declarations: [TitleImportComponent],
  imports: [
    CommonModule,

    // Blockframes
    ImportModule,

    // Routes
    RouterModule.forChild(routes)
  ]
})
export class TitleImportModule { }
