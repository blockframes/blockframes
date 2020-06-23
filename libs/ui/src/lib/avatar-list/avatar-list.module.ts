import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AvatarListComponent } from "./avatar-list.component";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatIconModule } from "@angular/material/icon";
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

@NgModule({
  declarations: [AvatarListComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatIconModule,
    ImageReferenceModule,
  ],
  exports: [AvatarListComponent],
})
export class AvatarListModule { }
