import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Material } from '../../material/+state';
import { TemplateService } from '../+state';


@Component({
  selector: 'template-form',
  templateUrl: './template-form.component.html',
  styleUrls: ['./template-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateFormComponent implements OnInit {

  @Input() materials: Material[];
  @Input() category: string;

  constructor(
    private service: TemplateService,
  ) { }

  ngOnInit() {
  }

  public updateCategory(newCategory) {
    this.service.updateCategory(newCategory, this.materials);
  }

  public deleteCategory() {
    this.service.deleteCategory(this.materials);
  }


}
