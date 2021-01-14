import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AvatarListComponent } from "./avatar-list.component";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatIconModule } from "@angular/material/icon";
import { ImageModule } from '@blockframes/media/image/directives/image.module';

@NgModule({
  declarations: [AvatarListComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatIconModule,
    ImageModule,
  ],
  exports: [AvatarListComponent],
})
export class AvatarListModule { }
