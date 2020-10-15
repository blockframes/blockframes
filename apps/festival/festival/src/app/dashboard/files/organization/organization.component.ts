import { ChangeDetectionStrategy, Component } from '@angular/core';

// Blockframes
import { MediaService } from '@blockframes/media/+state/media.service';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { OrganizationMediasForm } from '@blockframes/organization/forms/medias.form';
import { HostedMediaWithMetadata } from '@blockframes/media/+state/media.firestore';

import { AddFileDialogComponent } from '@blockframes/media/components/dialog/add-file.component';

// Material
import { MatDialog } from '@angular/material/dialog';
import { HostedMediaWithMetadataForm } from '@blockframes/media/form/media-with-metadata.form';
import { extractMediaFromDocumentBeforeUpdate } from '@blockframes/media/+state/media.model';

const columns = { 
  ref: 'Type',
  title: 'Document Name',
  edit: 'Edit',
  delete: 'Delete'
 };

@Component({
  selector: 'festival-dashboard-organization-resources',
  templateUrl: 'organization.component.html',
  styleUrls: ['./organization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationResourcesComponent {
  public org$ = this.query.selectActive();

  public columns = columns;
  public initialColumns = Object.keys(columns);

  constructor(
    private dialog: MatDialog,
    private mediaService: MediaService,
    private organizationService: OrganizationService,
    private query: OrganizationQuery,
  ) {}

  public async deleteFile(note: HostedMediaWithMetadata) {
    const org = this.query.getActive()
    const notes = org.documents.notes.filter(n => n.title !== note.title);
    await this.organizationService.update(org.id, { documents: { notes: notes } });
  }

  public openDialog(note?: Partial<HostedMediaWithMetadata>) {
    const org = this.query.getActive();
    const documentsForm = new OrganizationMediasForm(org.documents);
    let noteForm: HostedMediaWithMetadataForm;
    if (note) {
      noteForm = documentsForm.get('notes').controls.find(ctrl => ctrl.value.title === note.title);
    } else {
      noteForm = documentsForm.get('notes').add();
    }

    const dialog = this.dialog.open(AddFileDialogComponent, { width: '60vw', data: {
      note: noteForm,
      privacy: 'protected',
      storagePath: `orgs/${org.id}/documents/notes/`
    }});
    dialog.afterClosed().subscribe(async note => {
      if (!!note) {
        const { documentToUpdate, mediasToUpload } = extractMediaFromDocumentBeforeUpdate(documentsForm);
        await this.organizationService.update(org.id, { documents: documentToUpdate });
        this.mediaService.uploadMedias(mediasToUpload);
      }
    });
  }
}