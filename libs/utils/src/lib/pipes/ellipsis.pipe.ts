import { NgModule, Pipe, PipeTransform } from '@angular/core';

/**
 * ellipsis('very long text here', 10) = 'very long ...'
 */
@Pipe({ name: 'ellipsis' })
export class EllipsPipe implements PipeTransform {
  transform(data: string, length: number=10, ellipsSymbole = '...') {
    return data.length > length ? data.slice(0, length) + ellipsSymbole : data;
  }
}

@NgModule({
  declarations: [EllipsPipe],
  exports: [EllipsPipe]
})
export class EllipsisPipeModule { }
