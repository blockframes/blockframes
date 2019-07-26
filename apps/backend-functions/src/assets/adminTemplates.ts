/**
 * Templates for the admin pages,
 *
 * these are minimal pages that we use to let cascade8's admin manage
 * the application without having to touch the db.
 */

/** The simple form that we use to let an admin accept an org. */
export function acceptNewOrgPage(orgId: string): string {
  return `
     <html>
     Organization ${orgId}
     
     <form method="post">
         <button type="submit">Accept</button>
     </form>
     </html>
     `;
}

/** The simple feedback page when the admin accepted an org. */
export function acceptNewOrgPageComplete(orgId: string): string {
  return `
     <html>
     Organization ${orgId} is now online!
     </html>
     `;
}
