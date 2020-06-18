import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'imgSize'})
export class ImgSizePipe implements PipeTransform {
  constructor() {}

  transform(size: string): string {
    return size.toUpperCase();
  }
}