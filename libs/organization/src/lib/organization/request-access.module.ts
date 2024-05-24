// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// BlockFrames
import { OrgRequestAccessComponent } from './pages/request-access/request-access.component';
import { OrgRequestAccessPendingComponent } from './pages/request-access-pending/request-access-pending.component';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { AppPipeModule } from '@blockframes/utils/pipes';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule } from '@angular/forms';

export const requestAccessRoutes: Routes = [
  { 
    path: '', 
    component: OrgRequestAccessComponent 
  },
  {
    path: 'pending',
    component: OrgRequestAccessPendingComponent
  }
];
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    AppLogoModule,
    ImageModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    RouterModule.forChild(requestAccessRoutes),
    MatButtonToggleModule,
    MatTooltipModule,
    AppPipeModule
  ],
  declarations: [OrgRequestAccessComponent, OrgRequestAccessPendingComponent]
})
export class OrgRequestAccessModule {}
