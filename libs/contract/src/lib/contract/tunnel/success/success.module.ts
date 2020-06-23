import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { SuccessComponent } from "./success.component";
import { RouterModule } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { ImgModule } from '@blockframes/ui/media/img/img.module';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        ImgModule,
        RouterModule.forChild([{ path: '', component: SuccessComponent }]),
        MatButtonModule
    ],
    declarations: [SuccessComponent],
})
export class SuccessModule { }