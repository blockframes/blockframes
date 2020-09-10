// Angular
import { Component, ChangeDetectionStrategy, OnInit, ViewChildren, QueryList, AfterViewInit, ElementRef, } from '@angular/core';

// Component
import { MovieFormShellComponent } from '../shell/shell.component';

// Utils
import { RouterQuery } from '@datorama/akita-ng-router-store';

// Material
import { MatRadioButton } from '@angular/material/radio';

@Component({
  selector: 'movie-form-title-status',
  templateUrl: 'title-status.component.html',
  styleUrls: ['./title-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleStatusComponent implements OnInit, AfterViewInit {
  public form = this.shell.form;

  private status: string;

  @ViewChildren('image') images: QueryList<ElementRef<HTMLImageElement>>
  @ViewChildren('radioButton') radioButton: QueryList<MatRadioButton>

  constructor(private shell: MovieFormShellComponent, private routerQuery: RouterQuery) { }

  ngOnInit() {
    this.status = this.routerQuery.getData()?.productionStatus
    if (this.status) {
      this.form.productionStatus.setValue(this.status)
    }
  }

  ngAfterViewInit() {
    this.images.forEach(image => {
      if (!image.nativeElement.srcset.includes(this.status) && !!this.status) {
        image.nativeElement.style.opacity = '0.5'
      }
    })
    this.radioButton.forEach(button => {
      if (button.value !== this.status && !!this.status) {
        button.disabled = true;
      }
    })
  }

  setValue(value: string) {
    /* If status is defined via the router data object, we don't want to change
    the status via the click event from the image */
    if (!this.status) {
      this.form.productionStatus.setValue(value)
    }
  }
}