import { Pipe, PipeTransform, NgModule } from "@angular/core";

@Pipe({
  name: 'isEmptyImgRef'
})
export class EmptyImagePipe implements PipeTransform {
  transform(
    ref: string
  ): boolean {
    try {
      return !ref;
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
