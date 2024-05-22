import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventRoleComponent } from './role.component';
import { RouterModule } from '@angular/router';

// Material
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';

@NgModule({
  declarations: [EventRoleComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    ImageModule,
    AppLogoModule,
    RouterModule.forChild([{ path: '', component: EventRoleComponent }]),
  ]
})
export class RoleModule { }
