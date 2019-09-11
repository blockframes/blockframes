import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

// Material
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule, MatDialogModule, MatCheckboxModule } from "@angular/material";

// Libraries
import { UiFormModule } from "@blockframes/ui";

// Components
import { MovieImdbSearchComponent } from "./movie-imdb-search.component";

@NgModule({
  declarations: [
    MovieImdbSearchComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,

    // Material
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    MatCheckboxModule,

    // Librairies
    UiFormModule,
  ],
  providers: [ ],
  entryComponents: [
    MovieImdbSearchComponent
  ],
  exports: [
    MovieImdbSearchComponent
  ],
})
export class MovieImdbSearchModule {}
