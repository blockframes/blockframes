import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { Prize } from '@blockframes/movie/+state';
import { staticModel } from '@blockframes/utils/static-model';

@Pipe({ name: 'festivalPrize' })
export class PrizePipe implements PipeTransform {
  transform(prize: Prize) {
    let array = [];

    if (prize.name) {
      if (Object.keys(staticModel['festival']).includes(prize.name)) {
        array.push(staticModel['festival'][prize.name])
      }
      else array.push(prize.name)
    }
    if (prize.prize) array.push(prize.prize);
    if (prize.year) array.push(prize.year);
    if (prize.premiere) array.push(`${staticModel['premiereType'][prize.premiere]} Premiere`);

    const displayPrize = array.join(' - ');
    console.log(displayPrize)
    return displayPrize;
  }
}


@NgModule({
  imports: [],
  exports: [PrizePipe],
  declarations: [PrizePipe],
  providers: [],
})
export class PrizePipeModule { }
