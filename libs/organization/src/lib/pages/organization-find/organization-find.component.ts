import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map, filter } from 'rxjs/operators';

@Component({
  selector: 'organization-find',
  templateUrl: './organization-find.component.html',
  styleUrls: ['./organization-find.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class OrganizationFindComponent implements OnInit {
  public addOrganizationForm = new FormGroup({
    org: new FormControl('')
  });
  orgOptions: Observable<string[]>;
  options: string[] = ['organization name', 'super org', 'org on fire'];

  ngOnInit() {
    this.orgOptions = this.addOrganizationForm.valueChanges
      .pipe(
        startWith(''),
        filter(value => !!value),
        map(value => this._filter(value.org))
      );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  public addOrganization() {
    // Create a new invitation
    console.log(this.addOrganizationForm.value)
  }
}
