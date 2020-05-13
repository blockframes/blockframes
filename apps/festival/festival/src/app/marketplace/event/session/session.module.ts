import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { ImgAssetModule } from '@blockframes/ui/theme';
import { SessionComponent } from './session.component';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { DisplayNameModule } from "@blockframes/utils/pipes/display-name.module";

// Materials
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [SessionComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImgAssetModule,
    ImageReferenceModule,
    MatButtonModule,
    MatIconModule,
    DisplayNameModule,
    RouterModule.forChild([{ path: '', component: SessionComponent }])
  ]
})
export class SessionModule { }
