
export function getWatermark(firstName: string, lastName: string, email: string) {
  return `
    <svg viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg">
      <style>
        text { text-anchor: end; }
        .name { font: 32px Arial; }
        .email { font: italic 24px Arial;}
      </style>
      <text x="100%" y="35%" fill="#fff" stroke="#000" class="name">${firstName} ${lastName}</text>
      <text x="100%" y="25%" fill="#fff" stroke="#000" class="email">${email}</text>
    </svg>
  `;
}
