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
import { DeliverySettingsComponent } from './delivery-settings/delivery-settings.component';
import { StakeholderListComponent } from './stakeholder-list/stakeholder-list.component';
import { StakeholderItemComponent } from './stakeholder-item/stakeholder-item.component';
import { DeliveryItemComponent } from './delivery-item/delivery-item.component';

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
    path: 'form/:deliveryId/settings',
    // canActivate: [DeliveryGuard],   //TODO: make this path to not redirected to default path when guard is active
    component: DeliverySettingsComponent
  }
];

@NgModule({
  declarations: [
    MovieMaterialsComponent,
    DeliveryListComponent,
    DeliveryViewComponent,
    DeliveryFormComponent,
    NewTemplateComponent,
    DeliverySettingsComponent,
    TemplatePickerComponent,
    StakeholderListComponent,
    StakeholderItemComponent,
    DeliveryItemComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MaterialModule,

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
