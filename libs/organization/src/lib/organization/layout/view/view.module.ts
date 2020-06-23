import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImgModule } from '@blockframes/ui/media/img/img.module';
import { AppBarModule } from '@blockframes/ui/app-bar';
import { ToLabelModule, TranslateSlugModule } from '@blockframes/utils/pipes';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';

// Components
import { ViewComponent } from './view.component';

// Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

@NgModule({
  declarations: [ViewComponent],
  exports: [ViewComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    ImgModule,
    AppBarModule,
    ToLabelModule,
    TranslateSlugModule,
    OrgNameModule,
    // Material
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
  ]
})
export class OrganizationViewModule { }
