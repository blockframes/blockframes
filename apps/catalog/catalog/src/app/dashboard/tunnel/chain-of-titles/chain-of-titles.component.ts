import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ImgRef } from "@blockframes/media/+state/media.firestore";
import { MovieTunnelComponent } from '../movie-tunnel.component';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'catalog-chain-of-titles',
  templateUrl: './chain-of-titles.component.html',
  styleUrls: ['./chain-of-titles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChainOfTitlesComponent {
  form = this.tunnel.form;

  constructor(private tunnel: MovieTunnelComponent, private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('Chain of titles', 'Title information')
  }

  get chainOfTitles() {
    return this.form.get('documents').get('chainOfTitles');
  }

  // get the ImgRef generated from firestorage and update url of media for each path
  importPDF(imgRef: ImgRef, i: number) {
    this.chainOfTitles.at(i).get('media').patchValue(imgRef);
  }
}
