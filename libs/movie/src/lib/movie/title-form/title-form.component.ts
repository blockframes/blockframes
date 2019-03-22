import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MovieService } from '../+state';
import { Router } from '@angular/router';

@Component({
  selector: 'movie-title-form',
  templateUrl: './title-form.component.html',
  styleUrls: ['./title-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleFormComponent implements OnInit {
  public titleForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<TitleFormComponent>,
    private builder: FormBuilder,
    private service: MovieService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.titleForm = this.builder.group({
      title: ['', Validators.required]
    });
  }

  public async newMovie() {
    try {
      const { title } = this.titleForm.value;
      await this.service.add(title).then(
        id =>  this.router.navigateByUrl(`form/${id}`)
      );
      this.dialogRef.close();
    } catch (err) {
      console.error(err);
    }
  }

  public cancel() {
    this.dialogRef.close();
  }

}
