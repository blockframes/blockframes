import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { NewTemplateComponent } from './components/delivery-new-template/new-template.component';
import { StakeholderRepertoryComponent } from './components/stakeholder-repertory/stakeholder-repertory.component';
import { StakeholderItemComponent } from './components/stakeholder-item/stakeholder-item.component';
import { MovieMaterialItemComponent } from './components/movie-material-item/movie-material-item.component';
import { DeliveryTeamworkFormComponent } from './components/delivery-teamwork-form/delivery-teamwork-form.component';
import { DeliveryTeamworkItemComponent } from './components/delivery-teamwork-item/delivery-teamwork-item.component';
import { DeliveryTeamworkRepertoryComponent } from './components/delivery-teamwork-repertory/delivery-teamwork-repertory.component';
import { DeliverySignComponent } from './components/delivery-sign/delivery-sign.component';
import { DeliveryActionsComponent } from './components/delivery-actions/delivery-actions.component';
import { DeliveryFiltersComponent } from './components/delivery-filters/delivery-filters.component';
import { DeliveryRepertoryComponent } from './components/delivery-repertory/delivery-repertory.component';
import { DeliveryInformationsDatesDisplayComponent } from './components/delivery-informations-dates-display/delivery-informations-dates-display.component';
import { DeliveryInformationsDatesFormComponent } from './components/delivery-informations-dates-form/delivery-informations-dates-form.component';
import { DeliveryDisplayComponent } from './components/delivery-display/delivery-display.component';
import { DeliveryMaterialFormComponent } from './components/delivery-material-form/delivery-material-form.component';

// Pages
import { MovieMaterialsViewComponent } from './pages/movie-materials-view/movie-materials-view.component';
import { DeliveryListComponent } from './pages/delivery-list/delivery-list.component';
import { DeliveryEditableComponent } from './pages/delivery-editable/delivery-editable.component';
import { DeliveryTemplateListComponent } from './pages/delivery-template-list/delivery-template-list.component';
import { DeliveryTeamworkEditableComponent } from './pages/delivery-teamwork-editable/delivery-teamwork-editable.component';
import { DeliveryAddFindMovieComponent } from './pages/delivery-add-find-movie/delivery-add-find-movie.component';
import { DeliveryAddChooseStarterComponent } from './pages/delivery-add-choose-starter/delivery-add-choose-starter.component';
import { DeliveryAddTemplatePickerComponent } from './pages/delivery-add-template-picker/delivery-add-template-picker.component';
import { DeliveryAddSettingsComponent } from './pages/delivery-add-settings/delivery-add-settings.component';
import { DeliveryInformationsEditableComponent } from './pages/delivery-informations-editable/delivery-informations-editable.component';

// Modules
import {
  ActionsListModule,
  ActionsPickerListModule,
  ActionsPickerModule,
  ConfirmModule,
  DirectivesModule,
  EditableModule,
  TeamWorkModule,
  UiFormModule,
  EditableSidenavModule
} from '@blockframes/ui';
import { OrganizationModule } from '@blockframes/organization';
import { MaterialModule } from '../material/material.module';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSortModule } from '@angular/material/sort';

// Guards
import { MovieActiveGuard, MovieListGuard, MovieModule } from '@blockframes/movie';
import { DeliveryActiveGuard } from './guards/delivery-active.guard';
import { DeliveryListGuard } from './guards/delivery-list.guard';
import {
  DeliveryMaterialsGuard,
  MovieMaterialsGuard
} from '../material';
import { TemplateActiveGuard } from '../template/guards/template-active.guard';
import { TemplateListGuard } from '../template/guards/template-list.guard';

const routes: Routes = [
  {
    path: 'add',
    canActivate: [MovieListGuard],
    canDeactivate: [MovieListGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '1-find-movie'
      },
      {
        path: '1-find-movie',
        pathMatch: 'full',
        component: DeliveryAddFindMovieComponent
      },
      {
        path: ':movieId',
        canActivate: [MovieActiveGuard],
        canDeactivate: [MovieActiveGuard],
        children: [
          {
            path: '2-choose-starter',
            pathMatch: 'full',
            component: DeliveryAddChooseStarterComponent
          },
          {
            path: '3-pick-template',
            canActivate: [TemplateListGuard],
            canDeactivate: [TemplateListGuard],
            pathMatch: 'full',
            component: DeliveryAddTemplatePickerComponent
          },
          {
            path: ':templateId',
            canActivate: [TemplateActiveGuard],
            canDeactivate: [TemplateActiveGuard],
            children: [
              {
                path: '4-settings',
                pathMatch: 'full',
                component: DeliveryAddSettingsComponent
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: ':movieId',
    canActivate: [MovieActiveGuard],
    canDeactivate: [MovieActiveGuard],
    children: [
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
        // TODO: Getting redirected to templates/list if there is no template to load => ISSUE#648
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
        children: [
          {
            path: '',
            redirectTo: 'view',
            pathMatch: 'full'
          },
          {
            path: 'edit',
            canActivate: [DeliveryMaterialsGuard],
            canDeactivate: [DeliveryMaterialsGuard],
            component: DeliveryEditableComponent
          },
          {
            path: 'teamwork',
            component: DeliveryTeamworkEditableComponent
          },
          {
            path: 'informations',
            canActivate: [DeliveryMaterialsGuard],
            canDeactivate: [DeliveryMaterialsGuard],
            component: DeliveryInformationsEditableComponent
          }
        ]
      }
    ]
  }
];

@NgModule({
  declarations: [
    MovieMaterialsViewComponent,
    DeliveryListComponent,
    DeliveryDisplayComponent,
    DeliveryEditableComponent,
    DeliveryAddFindMovieComponent,
    DeliveryAddChooseStarterComponent,
    DeliveryAddTemplatePickerComponent,
    DeliveryAddSettingsComponent,
    NewTemplateComponent,
    DeliveryTeamworkEditableComponent,
    DeliveryTemplateListComponent,
    StakeholderRepertoryComponent,
    StakeholderItemComponent,
    DeliveryFiltersComponent,
    DeliveryActionsComponent,
    MovieMaterialItemComponent,
    DeliveryTeamworkFormComponent,
    DeliveryTeamworkItemComponent,
    DeliveryTeamworkRepertoryComponent,
    DeliveryInformationsEditableComponent,
    DeliverySignComponent,
    DeliveryRepertoryComponent,
    DeliveryInformationsDatesDisplayComponent,
    DeliveryInformationsDatesFormComponent,
    DeliveryMaterialFormComponent
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
    ActionsListModule,
    ActionsPickerModule,
    ActionsPickerListModule,
    EditableModule,
    DirectivesModule,
    TeamWorkModule,
    OrganizationModule,
    EditableSidenavModule,

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
    MatAutocompleteModule,
    MatSortModule,

    RouterModule.forChild(routes),
    MovieModule
  ],
  entryComponents: [NewTemplateComponent, DeliverySignComponent]
})
export class DeliveryModule {}
