import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractForm } from '@blockframes/contract/contract/forms/contract.form';
import { createImgRef } from "@blockframes/utils/image-uploader";

@Component({
  selector: 'catalog-chain-of-titles',
  templateUrl: './chain-of-titles.component.html',
  styleUrls: ['./chain-of-titles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChainOfTitlesComponent {

  constructor(private form: ContractForm) { }

  get chainOfTitles() {
    return this.form.get('documents').get('chainOfTitles');
  }

    // get the url generated from firestorage and update url of media for each path
    importPDF(url: string, i: number) {
      const imgRefurl = createImgRef(url);
      this.chainOfTitles.at(i).get('media').patchValue(imgRefurl);
    }
}
