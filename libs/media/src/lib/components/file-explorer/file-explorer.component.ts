import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

// Blockframes
import { HostedMediaWithMetadata } from '@blockframes/media/+state/media.firestore';
import { extractMediaFromDocumentBeforeUpdate } from '@blockframes/media/+state/media.model';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { OrganizationMediasForm } from '@blockframes/organization/forms/medias.form';
import { AddFileDialogComponent } from '../dialog/add-file.component';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { HostedMediaWithMetadataForm } from '@blockframes/media/form/media-with-metadata.form';
import { MediaService } from '@blockframes/media/+state/media.service';
import { OrganizationDocumentWithDates } from '@blockframes/organization/+state/organization.firestore';

// Material
import { MatDialog } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';

const columns = { 
  ref: 'Type',
  title: 'Document Name',
  download: 'Download',
  edit: 'Edit',
  delete: 'Delete'
};

interface Directory {
  name: string,
  subDirectories: SubDirectory[]
}

interface SubDirectory {
  icon: 'folder' | 'template',
  name: string,
  path: string,
  selected?: boolean
}

@Component({
  selector: '[org] file-explorer',
  templateUrl: 'file-explorer.component.html',
  styleUrls: ['./file-explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileExplorerComponent {

  @Input() set org(org: OrganizationDocumentWithDates) {
    this.directories.push({
      name: org.denomination.full,
      subDirectories: [
        {
          icon: 'folder',
          name: 'Documents',
          path: 'documents.path',
          selected: true
        },
        // {
        //   icon: 'template',
        //   name: 'Logo',
        //   path: 'logo'
        // }
      ]
    });
    this.activeDirectory = this.directories[0].subDirectories[0];
    this.orgId = org.id;
    this.org$ = this.organizationService.valueChanges(org.id);
  };

  private orgId: string;
  public org$: Observable<OrganizationDocumentWithDates>;
  public directories: Directory[] = [];
  public activeDirectory: SubDirectory;
  public columns = columns;
  public initialColumns = Object.keys(columns);

  constructor(
    private dialog: MatDialog,
    private mediaService: MediaService,
    private organizationService: OrganizationService
  ) {}

  public selectItem(event: MatSelectionListChange) {
    const selected = event.source.selectedOptions.selected;
    const [ selectedValues ] = selected.map(x => x.value);
    this.activeDirectory = selectedValues;
  }

  public async deleteFile(note: HostedMediaWithMetadata) {
    const org = await this.organizationService.getValue(this.orgId);
    this.dialog.open(ConfirmComponent, {
      data: {
        title: 'Are you sure you want to delete this file?',
        question: ' ',
        buttonName: 'Yes',
        onConfirm: async () => {
          const notes = org.documents.notes.filter(n => n.title !== note.title);
          await this.organizationService.update(this.orgId, { documents: { notes: notes } });
        }
      }
    });
  }

  public async openDialog(item?: Partial<HostedMediaWithMetadata>) {
    const org = await this.organizationService.getValue(this.orgId);
    const documentsForm = new OrganizationMediasForm(org.documents);
    let noteForm: HostedMediaWithMetadataForm;
    if (item) {
      noteForm = documentsForm.get('notes').controls.find(ctrl => ctrl.value.title === item.title);
    } else {
      noteForm = documentsForm.get('notes').add();
    }

    const dialog = this.dialog.open(AddFileDialogComponent, { width: '60vw', data: {
      note: noteForm,
      privacy: 'protected',
      storagePath: `orgs/${this.orgId}/documents/notes/`
    }});
    dialog.afterClosed().subscribe(async note => {
      if (!!note) {
        const { documentToUpdate, mediasToUpload } = extractMediaFromDocumentBeforeUpdate(documentsForm);
        await this.organizationService.update(this.orgId, { documents: documentToUpdate });
        this.mediaService.uploadMedias(mediasToUpload);
      }
    });
  }

  public async downloadFile(item: Partial<HostedMediaWithMetadata>) {
    if (!item.ref) return;
    const url = await this.mediaService.generateImgIxUrl(item.ref);
    window.open(url);
  }
}