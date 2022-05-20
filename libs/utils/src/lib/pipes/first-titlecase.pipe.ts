import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { titleCase } from '@blockframes/model';

@Pipe({
  name: 'firstWordTitlecase'
})
export class FirstWordTitlecasePipe implements PipeTransform {
  transform(value: string): string {
    return titleCase(value)
  }
}

@NgModule({
  declarations: [FirstWordTitlecasePipe],
  imports: [CommonModule],
  exports: [FirstWordTitlecasePipe]
})
export class FirstWordTitlecaseModule { }
