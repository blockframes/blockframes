import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

// Blockframes
import { HostedMediaWithMetadata } from '@blockframes/media/+state/media.firestore';
import { extractMediaFromDocumentBeforeUpdate } from '@blockframes/media/+state/media.model';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { OrganizationMediasForm } from '@blockframes/organization/forms/medias.form';
import { AddFileDialogComponent } from '../dialog/add-file.component';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { HostedMediaWithMetadataForm } from '@blockframes/media/form/media-with-metadata.form';
import { MediaService } from '@blockframes/media/+state/media.service';

// Material
import { MatDialog } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';

const columns = { 
  ref: 'Type',
  title: 'Document Name',
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
  selector: 'file-explorer',
  templateUrl: 'file-explorer.component.html',
  styleUrls: ['./file-explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileExplorerComponent implements OnInit {
  public org$ = this.query.selectActive();

  public directories: Directory[] = []
  public activeDirectory: SubDirectory;
  public columns = columns;
  public initialColumns = Object.keys(columns);

  constructor(
    private dialog: MatDialog,
    private mediaService: MediaService,
    private organizationService: OrganizationService,
    private query: OrganizationQuery,
    ) { }

  ngOnInit() {
    const org = this.query.getActive();
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
    })
    this.activeDirectory = this.directories[0].subDirectories[0];
  }

  public selectItem(event: MatSelectionListChange) {
    const selected = event.source.selectedOptions.selected;
    const [ selectedValues ] = selected.map(x => x.value);
    this.activeDirectory = selectedValues;
  }

  public async deleteFile(note: HostedMediaWithMetadata) {
    this.dialog.open(ConfirmComponent, {
      data: {
        title: 'Are you sure you want to delete this file?',
        question: ' ',
        buttonName: 'Yes',
        onConfirm: async () => {
          const org = this.query.getActive()
          const notes = org.documents.notes.filter(n => n.title !== note.title);
          await this.organizationService.update(org.id, { documents: { notes: notes } });
        }
      }
    });
  }

  public openDialog(item?: Partial<HostedMediaWithMetadata>) {
    const org = this.query.getActive();
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