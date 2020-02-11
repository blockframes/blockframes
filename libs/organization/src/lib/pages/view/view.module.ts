import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { ImgAssetModule } from '@blockframes/ui/theme/img-asset.module';
import { OrganizationViewComponent } from './view.component';

// Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [OrganizationViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageReferenceModule,
    ImgAssetModule,
    // Material
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: OrganizationViewComponent}])
  ]
})
export class OrganizationViewModule { }
