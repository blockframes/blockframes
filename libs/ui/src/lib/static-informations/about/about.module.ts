// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Pages
import { AboutComponent } from './about.component';

// Material
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [AboutComponent],
  imports: [
    CommonModule,
    MatCardModule,
    FlexLayoutModule,
    RouterModule.forChild([
      {
        path: '',
        component: AboutComponent
      }
    ])
  ]
})
export class AboutModule {}
