// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Pages
import { ContactPageComponent } from './contact-page.component';

// Material
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [ContactPageComponent],
  imports: [
    CommonModule,
    MatCardModule,
    FlexLayoutModule,
    RouterModule.forChild([
      {
        path: '',
        component: ContactPageComponent
      }
    ])
  ]
})
export class ContactModule {}
