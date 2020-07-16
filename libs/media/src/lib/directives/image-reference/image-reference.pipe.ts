import { Pipe, PipeTransform, NgModule } from "@angular/core";
import { HostedMedia } from "@blockframes/media/+state/media.model";


@Pipe({
  name: 'isEmptyImgRef'
})
export class EmptyImagePipe implements PipeTransform {
  transform(
    image: HostedMedia
  ): boolean {
    try {
      return !image.url;
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
