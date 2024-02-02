
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { RightImportModule } from '@blockframes/waterfall/import/rights/import.module';

import { WaterfallImportRightsComponent } from './rights.component';


@NgModule({
  declarations: [ WaterfallImportRightsComponent ],
  imports: [
    RightImportModule,

    RouterModule.forChild([
      { path: '', component: WaterfallImportRightsComponent },
    ]),
  ],
})
export class WaterfallImportRightsModule {}