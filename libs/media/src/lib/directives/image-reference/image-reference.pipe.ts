import { Pipe, PipeTransform, NgModule } from "@angular/core";


@Pipe({
  name: 'isEmptyImgRef'
})
export class EmptyImagePipe implements PipeTransform {
  transform(
    image: string
  ): boolean {
    try {
      return !image;
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
