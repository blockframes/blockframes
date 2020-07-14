import { Pipe, PipeTransform, NgModule } from "@angular/core";
import { ImgRef } from "@blockframes/media/+state/media.model";


@Pipe({
  name: 'isEmptyImgRef'
})
export class EmptyImagePipe implements PipeTransform {
  transform(
    image: ImgRef
  ): boolean {
    try {
      return !image.original.url;
    } catch (error) {
      console.warn(error);
      return true;
    }
  }
}

@NgModule({
  exports: [EmptyImagePipe],
  declarations: [EmptyImagePipe],
})
export class EmptyImagePipeModule { }
