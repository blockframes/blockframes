import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AvatarListComponent } from "./avatar-list.component";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatIconModule } from "@angular/material";
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';

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
