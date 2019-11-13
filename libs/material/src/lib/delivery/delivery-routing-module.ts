import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Pages
import { DeliveryAddFindMovieComponent } from "./pages/delivery-add-find-movie/delivery-add-find-movie.component";
import { DeliveryAddChooseStarterComponent } from "./pages/delivery-add-choose-starter/delivery-add-choose-starter.component";
import { DeliveryAddTemplatePickerComponent } from "./pages/delivery-add-template-picker/delivery-add-template-picker.component";
import { DeliveryAddSpecificDeliveryListPickerComponent } from "./pages/delivery-add-specific-delivery-list-picker/delivery-add-specific-delivery-list-picker.component";
import { DeliveryAddSettingsComponent } from "./pages/delivery-add-settings/delivery-add-settings.component";
import { DeliveryListComponent } from "./pages/delivery-list/delivery-list.component";
import { DeliveryEditableComponent } from "./pages/delivery-editable/delivery-editable.component";
import { DeliveryStakeholdersEditableComponent } from './pages/delivery-stakeholders-editable/delivery-stakeholders-editable.component';
import { DeliveryInformationsEditableComponent } from "./pages/delivery-informations-editable/delivery-informations-editable.component";
import { MovieEditableComponent } from "./pages/movie-editable/movie-editable.component";

// Guards
import { MovieOrganizationListGuard, MovieActiveGuard } from "@blockframes/movie";
import { MovieMaterialsGuard, DeliveryMaterialsGuard } from "../material";
import { DeliveryListGuard } from "./guards/delivery-list.guard";
import { DeliveryActiveGuard } from "./guards/delivery-active.guard";
import { TemplateListGuard } from "../template/guards/template-list.guard";
import { TemplateActiveGuard } from "../template/guards/template-active.guard";

const routes: Routes = [
  {
    path: 'add',
    canActivate: [MovieOrganizationListGuard],
    canDeactivate: [MovieOrganizationListGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '1-find-movie'
      },
      {
        path: '1-find-movie',
        pathMatch: 'full',
        component: DeliveryAddFindMovieComponent,
        data: {animation: 'DeliveryAddFindMoviePage'}

      },
      {
        path: ':movieId',
        canActivate: [MovieActiveGuard],
        canDeactivate: [MovieActiveGuard],
        children: [
          {
            path: '2-choose-starter',
            pathMatch: 'full',
            component: DeliveryAddChooseStarterComponent,
            data: {animation: 'DeliveryAddChooseStarterPage'}
          },
          {
            path: '3-pick-template',
            canActivate: [TemplateListGuard],
            canDeactivate: [TemplateListGuard],
            pathMatch: 'full',
            component: DeliveryAddTemplatePickerComponent,
            data: {animation: 'DeliveryAddTemplatePickerPage'}
          },
          {
            path: '3-pick-specific-delivery-list',
            pathMatch: 'full',
            component: DeliveryAddSpecificDeliveryListPickerComponent
          },
          {
            path: '4-settings',
            pathMatch: 'full',
            component: DeliveryAddSettingsComponent,
            data: {animation: 'DeliveryAddSettingsPage'}
          },
          {
            path: ':templateId',
            canActivate: [TemplateActiveGuard],
            canDeactivate: [TemplateActiveGuard],
            children: [
              {
                path: '4-settings',
                pathMatch: 'full',
                component: DeliveryAddSettingsComponent,
                data: {animation: 'DeliveryAddSettingsPage'}
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
        path: 'materials',
        canActivate: [MovieMaterialsGuard],
        canDeactivate: [MovieMaterialsGuard],
        component: MovieEditableComponent
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
            path: 'list',
            canActivate: [DeliveryMaterialsGuard],
            canDeactivate: [DeliveryMaterialsGuard],
            component: DeliveryEditableComponent,
            data: {animation: 'DeliveryEditablePage'}
          },
          {
            path: 'stakeholders',
            component: DeliveryStakeholdersEditableComponent,
            data: {animation: 'DeliveryStakeholdersEditablePage'} //animation test, find the corresponding file in ./utils/lib/animations/router-animations
          },
          {
            path: 'informations',
            canActivate: [DeliveryMaterialsGuard],
            canDeactivate: [DeliveryMaterialsGuard],
            component: DeliveryInformationsEditableComponent,
            data: {animation: 'DeliveryInformationsEditablePage'}
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeliveryRoutingModule {}
