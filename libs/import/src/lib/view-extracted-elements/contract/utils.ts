import { where } from 'firebase/firestore';
import { ContractsImportState } from '@blockframes/import/utils';
import { MovieService } from '@blockframes/movie/service';
import { OrganizationService } from '@blockframes/organization/service';
import {
  App,
  Contract,
  ContractType,
  isTermOverlappingExistingContracts,
  Movie,
  Organization,
  Term,
  createMandate,
  createSale,
  Mandate,
  MovieLanguageSpecification,
  Sale,
  User,
  Language,
  FullMandate,
  FullSale,
  createTerm
} from '@blockframes/model';
import { ContractService } from '@blockframes/contract/contract/service';
import { extract, SheetTab } from '@blockframes/utils/spreadsheet';
import { FieldsConfig, getContractConfig } from './fieldConfigs';
import { TermService } from '@blockframes/contract/term/service';

function toTerm(rawTerm: FieldsConfig['term'][number], contractId: string, termId: string) {

  const { medias, duration, territories_excluded = [], territories_included = [], exclusive, licensedOriginal } = rawTerm;

  const languages: Term['languages'] = {};

  const updateLanguage = (key: keyof MovieLanguageSpecification, rawLanguages: Language[] = []) => {
    for (const language of rawLanguages) {
      if (!languages[language])
        languages[language] = { caption: false, dubbed: false, subtitle: false };
      languages[language][key] = true;
    }
  };

  updateLanguage('caption', rawTerm.caption);
  updateLanguage('dubbed', rawTerm.dubbed);
  updateLanguage('subtitle', rawTerm.subtitle);

  const territories = territories_included.filter(territory => !territories_excluded.includes(territory));

  const id = termId;

  return createTerm({
    id,
    languages,
    contractId,
    medias,
    duration,
    territories,
    exclusive,
    licensedOriginal,
    criteria: [],
  });
}

const getTitleContracts = (type: ContractType, titleId: string) => [
  where('type', '==', type),
  where('titleId', '==', titleId),
  where('status', '==', 'accepted')
];

async function getExistingContracts(type: 'sale', titleId: string, contractService: ContractService, termService: TermService): Promise<FullSale[]>;
async function getExistingContracts(type: 'mandate', titleId: string, contractService: ContractService, termService: TermService): Promise<FullMandate[]>;
async function getExistingContracts(type: ContractType, titleId: string, contractService: ContractService, termService: TermService): Promise<(FullSale | FullMandate)[]> {
  const query = getTitleContracts(type, titleId);
  const contracts = await contractService.getValue(query);
  const promises = contracts.map(contract => termService.getValue(contract.termIds));
  const terms = await Promise.all(promises);
  return contracts.map((contract, idx) => ({ ...contract, terms: terms[idx] }) as FullSale | FullMandate);
}

/**Verifies if terms overlap with existing mandate terms in the Db */
async function verifyOverlappingMandatesAndSales(contract: Partial<Contract>, terms: Term[], contractService: ContractService, termService: TermService) {
  const existingMandates = await getExistingContracts('mandate', contract.titleId, contractService, termService);
  const existingSales = await getExistingContracts('sale', contract.titleId, contractService, termService);
  const result = terms.map(term => isTermOverlappingExistingContracts({ term, existingSales, existingMandates }));

  const sale = contract.type === 'sale' && result.some(r => r.sold);
  const mandate = contract.type === 'mandate' && result.some(r => r.licensed);
  return { sale, mandate };
}

export interface FormatConfig {
  app: App;
  centralOrg: Organization;
}

export async function formatContract(
  sheetTab: SheetTab,
  orgService: OrganizationService,
  titleService: MovieService,
  contractService: ContractService,
  termService: TermService,
  blockframesAdmin: boolean,
  userOrgId: string,
  config: FormatConfig
) {
  // Cache to avoid  querying db every time
  const orgNameCache: Record<string, string> = {};
  const titleCache: Record<string, Movie> = {};
  const userCache: Record<string, User> = {};
  const contractCache: Record<string, Mandate | Sale> = {};
  const termCache: Record<string, Term> = {};
  const contracts: ContractsImportState[] = [];
  const caches = { orgNameCache, titleCache, userCache, contractCache, termCache };

  const option = {
    orgService,
    titleService,
    contractService,
    termService,
    blockframesAdmin,
    userOrgId,
    caches,
    config,
    separator: ';'
  };

  const fieldsConfig = getContractConfig(option);

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig, 11);
  for (const result of results) {
    const { data, errors } = result;

    const contract = data.contract.type === 'mandate'
      ? createMandate(data.contract as Mandate)
      : createSale(data.contract as Sale);

    const { titleId, sellerId } = contract;
    if (titleId && sellerId) {
      const movieBelongsToLicensor = await titleService.getValue(titleId).then(title => title.orgIds.includes(sellerId));
      if (!movieBelongsToLicensor) {
        errors.push({
          type: 'error',
          name: 'Wrong Licensor.',
          reason: `The movie does not belong to the licensor.`,
          message: `Please ensure the movie is a movie owned by the licensor.`
        });
      }
    }

    const terms = (data.term ?? []).map(term => toTerm(term, contract.id, term.id || termService.createId()));

    const overlap = await verifyOverlappingMandatesAndSales(contract, terms, contractService, termService);
    if (overlap.mandate) {
      errors.push({
        type: 'error',
        name: 'Contract',
        reason: 'A term overlaps with that of an existing contract.',
        message: 'A term overlaps with that of an existing contract.'
      });
    }
    if (overlap.sale) {
      errors.push({
        type: 'error',
        name: 'Contract',
        reason: 'The terms of the imported sale have already been sold.',
        message: 'The terms of the imported sale have already been sold.'
      });
    }
    // remove duplicate from stakeholders
    contract.stakeholders = Array.from(new Set([...contract.stakeholders]));

    contracts.push({ contract, terms, errors, newContract: true });
  }
  return contracts;
}
