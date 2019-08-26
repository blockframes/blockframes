import { Component, OnInit } from '@angular/core';
import { DistributionRightForm } from './create.form';
import { staticModels } from '@blockframes/movie';

@Component({
  selector: 'distribution-right-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class DistributionRightCreateComponent implements OnInit {
  public form = new DistributionRightForm();
  public movieTerritories: string[] = staticModels['TERRITORIES'].map(key => key.label);
  public movieMedias: string[] = staticModels['MEDIAS'].map(key => key.label);
  constructor() {}

  ngOnInit() {
  }

  public hasTerritory(territory: string) {
    this.form.get('territories');
  }
}
