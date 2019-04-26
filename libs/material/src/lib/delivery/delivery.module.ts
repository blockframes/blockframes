import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { MovieMaterialsComponent } from './movie-materials/movie-materials.component';
import { DeliveryListComponent } from './delivery-list/delivery-list.component';
import { DeliveryFormComponent } from './delivery-form/delivery-form.component';
import { NewTemplateComponent } from './delivery-new-template/new-template.component';
import { DeliveryGuard } from './guards/delivery.guard';
import { DeliveryViewComponent } from './delivery-view/delivery-view.component';
import { MaterialModule } from '../material/material.module';
import { TemplatePickerComponent } from '../template/template-picker/template-picker.component';
import { DeliveryTeamWorkViewComponent } from './delivery-team-work-view/delivery-team-work-view.component';
import { StakeholderListComponent } from './stakeholder-list/stakeholder-list.component';
import { StakeholderItemComponent } from './stakeholder-item/stakeholder-item.component';
import { DeliveryItemComponent } from './delivery-item/delivery-item.component';
import { FiltersComponent } from './movie-materials/filters/filters.component';
import { ActionsComponent } from './movie-materials/actions/actions.component';
import { MovieMaterialItemComponent } from './movie-material-item/movie-material-item.component';
import { DeliveryViewItemComponent } from './delivery-view-item/delivery-view-item.component';
import { DeliveryTeamWorkFormComponent } from './delivery-team-work-form/delivery-team-work-form.component';
import { DeliveryTeamWorkItemComponent } from './delivery-team-work-item/delivery-team-work-item.component';
import { DeliveryTeamWorkListComponent } from './delivery-team-work-list/delivery-team-work-list.component';
import { EditableModule } from '@blockframes/ui';
import { DotColorDirective } from '../directives/dot-color-directive';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import {
  MatInputModule,
  MatMenuModule,
  MatSidenavModule,
  MatDialogModule,
  MatSelectModule,
  MatOptionModule,
  MatExpansionModule
} from '@angular/material';
import { MatFormFieldModule } from '@angular/material';
import { ConfirmModule, UiFormModule } from '@blockframes/ui';
import { TeamWorkActionsComponent } from './delivery-team-work-view/team-work-actions/team-work-actions.component';
import { TeamWorkFiltersComponent } from './delivery-team-work-view/team-work-filters/team-work-filters.component';

const routes: Routes = [
  { path: '', component: DeliveryListComponent },
  {
    path: 'movie-materials',
    component: MovieMaterialsComponent
  },
  { path: 'list', component: DeliveryListComponent },
  {
    path: 'view/:deliveryId',
    canActivate: [DeliveryGuard],
    component: DeliveryViewComponent
  },
  {
    path: 'form/:deliveryId',
    // canActivate: [DeliveryGuard],   //TODO: make this path to not redirected to default path when guard is active
    component: DeliveryFormComponent
  },
  {
    path: 'form/:deliveryId/teamwork',
    // canActivate: [DeliveryGuard],   //TODO: make this path to not redirected to default path when guard is active
    component: DeliveryTeamWorkViewComponent
  }
];

@NgModule({
  declarations: [
    MovieMaterialsComponent,
    DeliveryListComponent,
    DeliveryViewComponent,
    DeliveryFormComponent,
    NewTemplateComponent,
    DeliveryTeamWorkViewComponent,
    TemplatePickerComponent,
    StakeholderListComponent,
    StakeholderItemComponent,
    DeliveryItemComponent,
    FiltersComponent,
    ActionsComponent,
    MovieMaterialItemComponent,
    DeliveryViewItemComponent,
    DeliveryTeamWorkFormComponent,
    DeliveryTeamWorkItemComponent,
    DeliveryTeamWorkListComponent,
    TeamWorkActionsComponent,
    TeamWorkFiltersComponent,
    DotColorDirective,
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

    RouterModule.forChild(routes)
  ],
  entryComponents: [TemplatePickerComponent, NewTemplateComponent,]
})
export class DeliveryModule {}
