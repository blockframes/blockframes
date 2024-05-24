import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotFoundComponent } from './not-found/not-found.component';
import { Routes, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';

export const errorRoutes: Routes = [
  { path: '', component: NotFoundComponent},
];

@NgModule({
  imports: [
    CommonModule,
    MatCardModule,
    ImageModule,
    FlexLayoutModule,
    MatButtonModule,
    RouterModule.forChild(errorRoutes)
  ],
  declarations: [NotFoundComponent],
  exports: [NotFoundComponent]
})
export class ErrorNotFoundModule {}
