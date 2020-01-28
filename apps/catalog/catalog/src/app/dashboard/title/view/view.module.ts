import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';

import { TitleViewComponent } from './view.component';

// Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

const routes = [{
  path: '',
  component: TitleViewComponent,
  children: [
    {
      path: '',
      redirectTo: 'sales',
      pathMatch: 'full'
    },
    {
      path: 'sales',
      loadChildren: () => import('../sales/sales.module').then(m => m.TitleSalesModule)
    },
    {
      path: 'details',
      loadChildren: () => import('../details/details.module').then(m => m.TitleDetailsModule)
    },
    {
      path: 'avails',
      loadChildren: () => import('../avails/avails.module').then(m => m.TitleAvailsModule)
    }
  ]
}];

@NgModule({
  declarations: [TitleViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageReferenceModule,
    // Material
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    // Routes
    RouterModule.forChild(routes)
  ]
})
export class TitleViewModule {}
