import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { TemplateService, Template } from '../+state';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'template-item',
  templateUrl: './template-item.component.html',
  styleUrls: ['./template-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateItemComponent implements OnInit{

  @Input() template: Template;
  public creationDate: any;

  constructor(
    private service: TemplateService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.creationDate = this.template.created.toDate();
  }

  public stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }

  public deleteTemplate(id: string) {
    this.service.deleteTemplate(id);
    this.snackBar.open( 'Template "' + this.template.name + '" has been deleted.', 'close', { duration: 2000 });
  }

  public randomNumberPicker(scale: number) {
    return Math.floor(Math.random() * scale) + 2;
  }
}
