import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, Optional } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import {
  extract, ExtractConfig, SheetTab, ValueWithWarning, getStatic,
  getStaticList,
  split,
} from '@blockframes/utils/spreadsheet';
import { createMandate, createSale, Mandate, Sale } from '@blockframes/contract/contract/+state/contract.model';
import { createTerm } from '@blockframes/contract/term/+state/term.model';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { Intercom } from 'ng-intercom';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { ContractsImportState, SpreadsheetImportError } from '../../../import-utils';
import { AuthQuery } from '@blockframes/auth/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { Media, Territory } from '@blockframes/utils/static-model';
import { AngularFirestore } from '@angular/fire/firestore';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { centralOrgId } from '@env';
import { createMovieLanguageSpecification } from '@blockframes/movie/+state/movie.model';

const separator = ';'
type errorCodes = 'no-title-id' | 'no-seller-id' | 'wrong-contract-id' | 'no-buyer-id' | 'no-stakeholders' | 'no-territories' | 'no-medias' | 'no-duration-from' | 'no-duration-to';

const errorsMap: { [key in errorCodes]: SpreadsheetImportError } = {
  'no-title-id': {
    type: 'warning',
    field: 'contract.titleId',
    reason: `No title found`,
    name: 'no-title-id',
    hint: 'Please check the international title or enter the ID of the title'
  },
  'no-seller-id': {
    type: 'warning',
    field: 'contract.sellerId',
    reason: `Couldn't find Licensor with the provided name.`,
    name: 'Seller ID',
    hint: 'Edit corresponding sheet field.'
  },
  'no-buyer-id': {
    type: 'warning',
    field: 'contract.buyerId',
    reason: `Couldn't find Licensee with the provided name.`,
    name: 'Buyer ID',
    hint: 'Edit corresponding sheet field.'
  },
  'wrong-contract-id': {
    type: 'warning',
    field: 'contract.contractId',
    reason: `Couldn't find contract with provided Id`,
    name: 'Contract Id',
    hint: 'Edit corresponding sheet field.'
  },
  'no-stakeholders': {
    type: 'warning',
    field: 'contract.stakeholders',
    name: 'Stakeholders',
    reason: 'If this mandate has stakeholders, please fill in the name',
    hint: 'Edit corresponding sheet field.'
  },
  'no-territories': {
    type: 'error',
    field: 'term.territories',
    name: 'Territory',
    reason: 'Archipel Content needs to know the territories in which the movie can be sold.',
    hint: 'Edit corresponding sheet field.'
  },
  'no-medias': {
    type: 'error',
    field: 'term.medias',
    name: 'Media',
    reason: 'Archipel Content needs to know the medias in which the movie can be sold.',
    hint: 'Edit corresponding sheet field.'
  },
  'no-duration-from': {
    type: 'warning',
    field: 'term.duration.from',
    name: 'Duration from',
    reason: 'Archipel Content needs to know the starting date of the contract.',
    hint: 'Edit corresponding sheet field.'
  },
  'no-duration-to': {
    type: 'warning',
    field: 'term.duration.to',
    name: 'Duration to',
    reason: 'Archipel Content needs to know the ending date of the contract.',
    hint: 'Edit corresponding sheet field.'
  }
}

// Time is MM/DD/YYYY
function convertDate(time: string) {
  if (isNaN(+time)) {
    const [month, day, year] = time.split(/[/.]+/).map(t => parseInt(t, 10));
    return new Date(year, month - 1, day, 0, 0, 0);
  } else {
    return new Date(Math.round(+time - 25569) * 86400 * 1000);
  }
}

function getDate(value: string, error: SpreadsheetImportError) {
  const date = convertDate(value);
  if (isNaN(date.getTime()))
    return new ValueWithWarning(value, error);
  return date;
}

interface FieldsConfig {
  title: {
    international: string,
  },
  type: 'mandate' | 'sale',
  licensorName: string,
  licenseeName: string,
  territories: Territory[],
  medias: Media[],
  exclusive: boolean,
  duration: {
    from: Date,
    to: Date,
  },
  originalLanguageLicensed: string,
  dubbed: Territory[],
  subtitle: Territory[],
  closedCaptioning: Territory[],
  contractId: string,
  parentTermId: string,
  titleId?: string,
  stakeholdersList: string[],
}

type FieldsConfigType = ExtractConfig<FieldsConfig>;


const fieldsConfig: FieldsConfigType = {
  /* a */'title.international': (value: string) => value,
  /* b */'type': (value: string) => value.toLowerCase() as 'mandate' | 'sale',
  /* c */'licensorName': (value: string) => value,
  /* d */'licenseeName': (value: string) => value,
  /* e */'territories': (value: string) => getStaticList('territories', value, separator, errorsMap['no-territories']) as Territory[],
   /* f */'medias': (value: string) => getStaticList('medias', value, separator, errorsMap['no-medias']) as Media[],
   /* g */'exclusive': (value: string) => value.toLowerCase() === 'yes' ? true : false,
   /* h */'duration.from': (value: string) => getDate(value, errorsMap['no-duration-from']) as Date,
   /* i */'duration.to': (value: string) => getDate(value, errorsMap['no-duration-to']) as Date,
   /* j */'originalLanguageLicensed': (value: string) => value,
   /* k */'dubbed': (value: string) => getStaticList('languages', value, separator) as Territory[],
   /* l */'subtitle': (value: string) => getStaticList('languages', value, separator) as Territory[],
   /* m */'closedCaptioning': (value: string) => getStaticList('languages', value, separator) as Territory[],
   /* n */'contractId': (value: string) => value,
   /* o */'parentTermId': (value: string) => value,
   /* p */'titleId': (value: string) => value,
   /* q */'stakeholdersList': (value: string) => value ? split(value, separator) : [value],
} as const;




@Component({
  selector: 'import-view-extracted-contracts',
  templateUrl: './view-extracted-contracts.component.html',
  styleUrls: ['./view-extracted-contracts.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewExtractedContractsComponent implements OnInit {

  public contractsToUpdate = new MatTableDataSource<ContractsImportState>();
  public contractsToCreate = new MatTableDataSource<ContractsImportState>();
  public isUserBlockframesAdmin = false;

  private memory = {
    org: {},
    title: {},
  };

  constructor(
    @Optional() private intercom: Intercom,
    private snackBar: MatSnackBar,
    private contractService: ContractService,
    private cdRef: ChangeDetectorRef,
    private authQuery: AuthQuery,
    private dynTitle: DynamicTitleService,
    private movieService: MovieService,
    private orgService: OrganizationService,
    private fire: AngularFirestore
  ) {
    this.dynTitle.setPageTitle('Submit your titles')
  }

  ngOnInit() {
    this.isUserBlockframesAdmin = this.authQuery.isBlockframesAdmin;
    this.cdRef.markForCheck();
  }

  private async getOrgId(name: string) {
    if (!name) return '';
    // @TODO #6586 carefull if you are on a anonymized db, centralOrgId.catalog org name will not be 'Archipel Content'
    if (name === 'Archipel Content') return centralOrgId.catalog;
    if (!this.memory.org[name]) {
      const orgs = await this.orgService.getValue(ref => ref.where('denomination.full', '==', name));
      this.memory.org[name] = orgs.length === 1 ? orgs[0].id : '';
    }
    return this.memory.org[name];
  }

  private async getTitleId(name: string) {
    if (!name) return '';
    if (!this.memory.title[name]) {
      const titles = await this.movieService.getValue(ref => ref.where('title.international', '==', name));
      this.memory.title[name] = titles.length === 1 ? titles[0].id : '';
    }
    return this.memory.title[name];
  }

  public async format(sheetTab: SheetTab) {
    this.clearDataSources();
    const matSnackbarRef = this.snackBar.open('Loading... Please wait', 'close');

    for (const rawRow of sheetTab.rows) {
      const row = rawRow.map(cell => typeof cell === "string" ? cell.trim() : cell.toString());
      if (!row.length) continue;

      const { data, errors: warnings, warnings: errors, } = extract<FieldsConfig>([row], fieldsConfig)

      //////////////
      // CONTRACT //
      //////////////
      // TITLE
      const titleId = data.titleId || (await this.getTitleId(data.title.international));

      if (!titleId) errors.push(errorsMap['no-title-id']);

      // BUYER / SELLER
      const [sellerId, buyerId] = await Promise.all([
        this.getOrgId(data.licensorName),
        this.getOrgId(data.licenseeName)
      ])
      if (!sellerId) errors.push(errorsMap['no-seller-id']);
      if (!buyerId) errors.push(errorsMap['no-buyer-id']);

      // STAKEHOLDER
      const getStakeholders = Array.isArray(data.stakeholdersList) ? data.stakeholdersList.map(orgName => this.getOrgId(orgName)) : [];
      const stakeholders: string[] = (await Promise.all(getStakeholders)).filter(s => !!s);
      if (!stakeholders.length) errors.push(errorsMap['no-stakeholders']);

      // PARENT TERM ID
      // TODO add parentTermId to the sales & mandates

      // CONTRACT
      let baseContract: Partial<Mandate | Sale> = {};
      if (data.contractId) {
        baseContract = await this.contractService.getValue(data.contractId as string);
        if (!baseContract) errors.push(errorsMap['wrong-contract-id']);
      } else {
        baseContract.id = this.fire.createId();
      }
      const contract = data.type === 'mandate'
        ? createMandate({ ...baseContract as Mandate, titleId, buyerId, sellerId, stakeholders, status: 'accepted' })
        : createSale({ ...baseContract as Sale, titleId, buyerId, sellerId, stakeholders, status: 'accepted' });


      ///////////
      // TERMS //
      ///////////
      const contractId = contract.id;

      const termId = this.fire.createId();
      const term = createTerm({ id: termId, contractId, duration: data.duration, territories: data.territories, medias: data.medias, exclusive: data.exclusive });

      // Languages
      for (const [key, languages] of Object.entries({ dubbed: data.dubbed, subtitle: data.subtitle, closedCaptioning: data.closedCaptioning })) {
        for (const language of languages) {
          if (!term.languages[language]) term.languages[language] = createMovieLanguageSpecification();
          term.languages[language][key] = true;
        }
      }

      contract.termIds.push(termId);

      this.contractsToCreate.data.push({
        contract,
        newContract: !data.contractId,
        errors,
        terms: [term]
      });
      console.log({ contract: this.contractsToCreate })
      // Forcing change detection
      this.contractsToCreate.data = [...this.contractsToCreate.data];
      this.cdRef.markForCheck();
    }

    matSnackbarRef.dismissWithAction(); // loading ended */
  }

  public openIntercom() {
    return this.intercom.show();
  }

  private clearDataSources() {
    this.contractsToCreate.data = [];
    this.contractsToUpdate.data = [];
  }

}
