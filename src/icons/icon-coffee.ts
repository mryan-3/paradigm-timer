export function renderCoffeeIcon(size = 18): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
    <path d="M80,56V32a8,8,0,0,1,16,0V56a8,8,0,0,1-16,0Zm40,0V32a8,8,0,0,1,16,0V56a8,8,0,0,1-16,0Zm96,56H200V88a8,8,0,0,0-8-8H32a8,8,0,0,0-8,8v88a64.07,64.07,0,0,0,64,64h64a64.07,64.07,0,0,0,64-64V168h16a32,32,0,0,0,32-32V144A32,32,0,0,0,216,112Zm16,32a16,16,0,0,1-16,16H200V128h16a16,16,0,0,1,16,16Z"/>
  </svg>`;
}
