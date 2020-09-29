import { copyFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { isMigrationRequired } from './tools';

const rulesPath = join(process.cwd(), 'firestore.rules');
const maintenanceRulesPath = join(process.cwd(), 'firestore.maintenance.rules');
const regularRulesBackupPath = join(process.cwd(), 'firestore.regular.rules');
const setMaintenanceRules = () => copyFileSync(maintenanceRulesPath, rulesPath);
const backupRegularRules = () => copyFileSync(rulesPath, regularRulesBackupPath);
const restoreRegularRules = () => copyFileSync(regularRulesBackupPath, rulesPath);
const deleteRuleBackup = () => unlinkSync(regularRulesBackupPath);

export async function prepareFirestoreRulesPreDeploy() {
  console.log('prepareFirestoreRulesPreDeploy: This will set up Firestore rules appropriately during deploy');
  if (await isMigrationRequired()) {
    backupRegularRules();
    setMaintenanceRules();
  }
}

export async function restoreFirestoreRulesPostDeploy() {
  console.log('restoreFirestoreRulesPostDeploy: This will restore regular rules when completing deployment');
  if (existsSync(regularRulesBackupPath)) {
    restoreRegularRules();
    deleteRuleBackup();
  }
}
