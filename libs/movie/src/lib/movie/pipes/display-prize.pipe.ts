import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { Prize, staticModel } from '@blockframes/model';

@Pipe({ name: 'festivalPrize' })
export class PrizePipe implements PipeTransform {
  transform(prize: Prize) {
    const displayPrizes: (string | number)[] = [];

    if (prize.name) displayPrizes.push(staticModel['festival'][prize.name] ?? prize.name);
    if (prize.prize) displayPrizes.push(prize.prize);
    if (prize.year) displayPrizes.push(prize.year);
    if (prize.premiere) displayPrizes.push(`${staticModel['premiereType'][prize.premiere]} Premiere`);

    return displayPrizes.join(' - ');
  }
}


@NgModule({
  exports: [PrizePipe],
  declarations: [PrizePipe],
})
export class PrizePipeModule { }
