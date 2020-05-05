/**
 * Templates for the admin pages,
 *
 * these are minimal pages that we use to let cascade8's admin manage
 * the application without having to touch the db.
 */

/** The simple page that we use to let an admin trigger a database backup. */
export function dataBackupPage(): string {
  return `
     <html>
     Trigger a backup:

     <form method="post">
         <input type="password" name="password" placeholder="password"/>
         <button type="submit">Backup</button>
     </form>
     </html>
     `;
}

/** The simple form that we use to let an admin trigger a database restore */
export function dataRestorePage(): string {
  return `
     <html>
     Trigger a restore, ⚠️ this will ERASE all changes since the last backup.

     <form method="post">
         <input type="password" name="password" placeholder="password"/>
         <button type="submit">Restore</button>
     </form>
     </html>
     `;
}

export function dataQuorumCreatePage(movie: string) {
  return `
    <html>
      Deploy a smart-contract for the movie : <strong>${movie}</strong>,<br/>
      and set the initial repartition.<br/><br/>

      <form method="post">
        <input type="password" name="quorumPassword" placeholder="quorum password"/><br/><br/>

        <!--<input type="text" name="participant" placeholder="participant"/>-->
        <label>
          How much percentage are you willing to give to the participant ?
        </label><br/>
        <input type="number" min="0" max="100" step="1" value="90" name="participantShare" placeholder="participant's share"/><br/>
        <em>Example : 90 mean that you give 90% of your share to the participant, and keep 10% for yourself.</em><br/>
        <button type="submit">Create</button>
      </form>
    </html>
  `;
}
