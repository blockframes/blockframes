
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SourceImportModule } from '@blockframes/waterfall/import/sources/import.module';

import { WaterfallImportSourcesComponent } from './sources.component';


@NgModule({
  declarations: [ WaterfallImportSourcesComponent ],
  imports: [
    SourceImportModule,

    RouterModule.forChild([
      { path: '', component: WaterfallImportSourcesComponent },
    ]),
  ],
})
export class WaterfallImportSourcesModule {}