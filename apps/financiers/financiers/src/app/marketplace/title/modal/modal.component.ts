import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Campaign, Movie, Organization } from '@blockframes/model';
import { Observable } from 'rxjs';

interface EmailData {
  subject: string;
  from: string;
  to: string;
  message: string;
}

interface Data {
  form: FormData;
  orgs: Organization[];
  movie: Movie;
  campaign: Observable<Campaign>;
  onSend: (emailData: EmailData, title: string, orgs: Organization[]) => void;
}

@Component({
  selector: 'financiers-movie-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieModalComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Data,
    public dialogRef: MatDialogRef<MarketplaceMovieModalComponent>,
  ) { }

}