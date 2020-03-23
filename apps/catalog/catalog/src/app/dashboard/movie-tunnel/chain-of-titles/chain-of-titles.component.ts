import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ImgRef } from "@blockframes/utils/image-uploader";
import { MovieTunnelComponent } from '../movie-tunnel.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'catalog-chain-of-titles',
  templateUrl: './chain-of-titles.component.html',
  styleUrls: ['./chain-of-titles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChainOfTitlesComponent {
  form = this.tunnel.form;

  constructor(private tunnel: MovieTunnelComponent, private title: Title) {
    this.title.setTitle('Chain of titles - Title information - Archipel Content')
  }

  get chainOfTitles() {
    return this.form.get('documents').get('chainOfTitles');
  }

  // get the ImgRef generated from firestorage and update url of media for each path
  importPDF(imgRef: ImgRef, i: number) {
    this.chainOfTitles.at(i).get('media').patchValue(imgRef);
  }
}
