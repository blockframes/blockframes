import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { NewTemplateComponent } from './components/delivery-new-template/new-template.component';
import { StakeholderRepertoryComponent } from './components/stakeholder-repertory/stakeholder-repertory.component';
import { StakeholderItemComponent } from './components/stakeholder-item/stakeholder-item.component';
import { DeliveryItemComponent } from './components/delivery-item/delivery-item.component';
import { MovieMaterialItemComponent } from './components/movie-material-item/movie-material-item.component';
import { DeliveryViewItemComponent } from './components/delivery-view-item/delivery-view-item.component';
import { DeliveryTeamWorkFormComponent } from './components/delivery-team-work-form/delivery-team-work-form.component';
import { DeliveryTeamWorkItemComponent } from './components/delivery-team-work-item/delivery-team-work-item.component';
import { DeliveryTeamWorkRepertoryComponent } from './components/delivery-team-work-repertory/delivery-team-work-repertory.component';
import { DeliverySettingsItemComponent } from './components/delivery-settings-item/delivery-settings-item.component';
import { DeliverySettingsFormComponent } from './components/delivery-settings-form/delivery-settings-form.component';
import { DeliverySignComponent } from './components/delivery-sign/delivery-sign.component';
import { DeliveryEmptyComponent } from './components/delivery-empty/delivery-empty.component';
import { DeliveryActionsComponent } from './components/delivery-actions/delivery-actions.component';
import { DeliveryFiltersComponent } from './components/delivery-filters/delivery-filters.component';

// Pages
import { MovieMaterialsViewComponent } from './pages/movie-materials-view/movie-materials-view.component';
import { DeliveryListComponent } from './pages/delivery-list/delivery-list.component';
import { DeliveryEditableComponent } from './pages/delivery-editable/delivery-editable.component';
import { DeliveryViewComponent } from './pages/delivery-view/delivery-view.component';
import { DeliveryTemplateListComponent } from './pages/delivery-template-list/delivery-template-list.component';
import { DeliveryTeamWorkEditableComponent } from './pages/delivery-team-work-editable/delivery-team-work-editable.component';
import { DeliverySettingsEditableComponent } from './pages/delivery-settings-editable/delivery-settings-editable.component';

// Modules
import { MaterialModule } from '../material/material.module';
import {
  EditableModule,
  DirectivesModule,
  TeamWorkModule,
  ConfirmModule,
  UiFormModule
} from '@blockframes/ui';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';

// Guards
import { DeliveryActiveGuard } from './guards/delivery-active.guard';
import { DeliveryListGuard } from './guards/delivery-list.guard';
import {
  DeliveryMaterialsGuard,
  MovieMaterialsGuard,
  SignedDeliveryMaterialsGuard,
 } from '../material';
import { TemplateListGuard } from '../template/guards/template-list.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    canActivate: [DeliveryListGuard],
    canDeactivate: [DeliveryListGuard],
    component: DeliveryListComponent
  },
  {
    path: 'template-picker',
    canActivate: [TemplateListGuard],
    canDeactivate: [TemplateListGuard],
    component: DeliveryTemplateListComponent
  },
  {
    path: 'movie-materials',
    canActivate: [MovieMaterialsGuard],
    canDeactivate: [MovieMaterialsGuard],
    component: MovieMaterialsViewComponent
  },
  {
    path: ':deliveryId',
    canActivate: [DeliveryActiveGuard],
    canDeactivate: [DeliveryActiveGuard],
    children : [
      {
        path: '',
        redirectTo: 'view',
        pathMatch: 'full'
      },
      {
        path: 'view',
        canActivate: [SignedDeliveryMaterialsGuard],
        canDeactivate: [SignedDeliveryMaterialsGuard],
        component: DeliveryViewComponent
      },
      {
        path: 'edit',
        canActivate: [DeliveryMaterialsGuard],
        canDeactivate: [DeliveryMaterialsGuard],
        component: DeliveryEditableComponent
      },
      {
        path: 'teamwork',
        component: DeliveryTeamWorkEditableComponent
      },
      {
        path: 'settings',
        canActivate: [DeliveryMaterialsGuard],
        canDeactivate: [DeliveryMaterialsGuard],
        component: DeliverySettingsEditableComponent
      }
    ]
  }
];

@NgModule({
  declarations: [
    MovieMaterialsViewComponent,
    DeliveryListComponent,
    DeliveryViewComponent,
    DeliveryEditableComponent,
    NewTemplateComponent,
    DeliveryTeamWorkEditableComponent,
    DeliveryTemplateListComponent,
    StakeholderRepertoryComponent,
    StakeholderItemComponent,
    DeliveryItemComponent,
    DeliveryFiltersComponent,
    DeliveryActionsComponent,
    MovieMaterialItemComponent,
    DeliveryViewItemComponent,
    DeliveryTeamWorkFormComponent,
    DeliveryTeamWorkItemComponent,
    DeliveryTeamWorkRepertoryComponent,
    DeliverySettingsItemComponent,
    DeliverySettingsFormComponent,
    DeliverySettingsEditableComponent,
    DeliverySignComponent,
    DeliveryEmptyComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MaterialModule,
    ConfirmModule,
    UiFormModule,
    EditableModule,
    DirectivesModule,
    TeamWorkModule,

    // Material
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatInputModule,
    MatMenuModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,

    RouterModule.forChild(routes)
  ],
  entryComponents: [NewTemplateComponent, DeliverySignComponent,]
})
export class DeliveryModule {}
