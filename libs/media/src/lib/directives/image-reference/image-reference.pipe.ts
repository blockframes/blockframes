import { Pipe, PipeTransform, NgModule } from "@angular/core";
import { HostedMedia } from "@blockframes/media/+state/media.firestore";


@Pipe({
  name: 'isEmptyImgRef'
})
export class EmptyImagePipe implements PipeTransform {
  transform(
    image: HostedMedia
  ): boolean {
    try {
      return !image.ref;
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
