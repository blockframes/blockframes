import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { SuccessComponent } from "./success.component";
import { RouterModule } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        ImageReferenceModule,
        RouterModule.forChild([{ path: '', component: SuccessComponent }]),
        MatButtonModule
    ],
    declarations: [SuccessComponent],
})
export class SuccessModule { }