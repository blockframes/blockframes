import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AvatarListComponent } from "./avatar-list.component";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatIconModule } from "@angular/material/icon";
import { ImgModule } from '@blockframes/media/components/img/img.module';

@NgModule({
  declarations: [AvatarListComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatIconModule,
    ImgModule,
  ],
  exports: [AvatarListComponent],
})
export class AvatarListModule { }
