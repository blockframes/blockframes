// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Pages
import { PrivacyPageComponent } from './privacy-page.component';

// Material
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [PrivacyPageComponent],
  imports: [
    CommonModule,
    MatCardModule,
    FlexLayoutModule,
    RouterModule.forChild([
      {
        path: '',
        component: PrivacyPageComponent
      }
    ])
  ]
})
export class PrivacyModule {}
