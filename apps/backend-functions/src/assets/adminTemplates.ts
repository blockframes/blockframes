

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

export function acceptNewOrgPageComplete(orgId: string): string {
  return `
     <html>
     Organization ${orgId} is now online!
     </html>
     `;
}
