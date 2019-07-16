// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { firebase } from '@env';

// Angular Fire
import { AngularFirestoreModule, FirestoreSettingsToken } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';

// Material
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule} from '@angular/material/menu';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

// Libraries
import { UploadModule, UiFormModule } from '@blockframes/ui';
import { StakeholderModule } from '../stakeholder/stakeholder.module';
import { MovieSharedModule } from './movie.shared.module';
import { ImportMovieModule } from './components/import/import-movie.module';

// Components
import { MovieEditableComponent } from './pages/movie-editable/movie-editable.component';
import { MovieFormComponent } from './components/movie-form/movie-form.component';
import { MovieFormMainComponent } from './components/movie-form/movie-form-main/movie-form-main.component';
import { MovieFormStoryComponent } from './components/movie-form/movie-form-story/movie-form-story.component'
import { MovieFormTeamComponent } from './components/movie-form/movie-form-team/movie-form-team.component';
import { MovieFormPromotionalComponent } from './components/movie-form/movie-form-promotional/movie-form-promotional.component';
import { MovieListComponent } from './pages/movie-list/movie-list.component';
import { MovieEmptyComponent } from './components/movie-empty/movie-empty.component';

import { MovieRoutingModule } from './movie-routing.module';
import { AngularFireModule } from '@angular/fire';
import { MovieTitleFormComponent } from './components/movie-title-form/movie-title-form.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { HomeEmptyComponent } from './components/home-empty/home-empty.component';
import { MovieForm } from './components/movie-form/movie.form';
import { MovieCreateComponent } from './pages/movie-create/movie-create.component';
import { MovieViewComponent } from './pages/movie-view/movie-view.component';

@NgModule({
  declarations: [
    MovieEditableComponent,
    MovieFormComponent,
    MovieFormStoryComponent,
    MovieListComponent,
    MovieTitleFormComponent,
    MovieFormMainComponent,
    MovieFormTeamComponent,
    MovieFormPromotionalComponent,
    HomeEmptyComponent,
    MovieEmptyComponent,
    MovieCreateComponent,
    MovieViewComponent,
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MovieRoutingModule,
    // Angular Fire
    AngularFireModule.initializeApp(firebase),
    AngularFirestoreModule,
    AngularFireStorageModule,
    // Material
    MatSnackBarModule,
    MatCardModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatListModule,
    MatDividerModule,
    MatCheckboxModule,
    MatMenuModule,
    MatTabsModule,
    MatGridListModule,
    MatExpansionModule,
    NgxMatSelectSearchModule,
    MatProgressSpinnerModule,
    // Librairies
    UploadModule,
    UiFormModule,
    StakeholderModule,
    ImportMovieModule,
    MovieSharedModule,
  ],
  providers: [
    { provide: FirestoreSettingsToken, useValue: {} },// TODO: Remove when @angular/fire is updated
    MovieForm
  ],
  entryComponents: [MovieTitleFormComponent],
  exports: [MovieTitleFormComponent],
})
export class MovieModule {}
