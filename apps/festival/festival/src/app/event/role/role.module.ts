import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventRoleComponent } from './role.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';

@NgModule({
  declarations: [EventRoleComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    MatCardModule,
    ImageModule,
    AppLogoModule,
    RouterModule.forChild([{ path: '', component: EventRoleComponent }]),
  ]
})
export class RoleModule { }
