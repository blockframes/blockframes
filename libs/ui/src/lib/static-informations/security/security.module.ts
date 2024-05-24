// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Pages
import { SecurityComponent } from './security.component';

@NgModule({
  declarations: [SecurityComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RouterModule.forChild([
      {
        path: '',
        component: SecurityComponent
      }
    ])
  ]
})
export class SecurityModule {}
