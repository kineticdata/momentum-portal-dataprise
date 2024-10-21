import { Suspense, lazy } from 'react';
// Import a map of dynamic imports for the tabler icons so we cna lazy load them
import tablerIcons from '@tabler/icons-react/dist/esm/dynamic-imports.mjs';
// Import function to create tabler icons so we can create pending and missing icons
import createTablerIcon from '@tabler/icons-react/dist/esm/createReactComponent.mjs';

// An empty icon to show while the actual icon is being loaded
const Pending = createTablerIcon('outline', 'icon-pending', 'IconPending', []);

// An icon to show if an icon with the provided name doesn't exist
const Missing = createTablerIcon('filled', 'icon-missing', 'IconMissing', [
  ['path', { d: 'M6 2h9l-13 13v-9a4 4 0 0 1 4 -4', key: 'svg-0' }],
  ['path', { d: 'M17 2h3l-18 18v-3z', key: 'svg-1' }],
  ['path', { d: 'M22 7v-3l-18 18h3z', key: 'svg-2' }],
  ['path', { d: 'M22 18v-9l-13 13h9a4 4 0 0 0 4 -4', key: 'svg-4' }],
]);

// TODO add more props and documentation
export const Icon = ({ name, filled, ...props }) => {
  // Append '-filled' to the name if the `filled` props is truthy
  const iconName = `${name}${filled && !name.endsWith('-filled') ? '-filled' : ''}`;
  // Check if the icon exists in the map of icons
  const iconImport = tablerIcons[iconName];

  // If it exists render it
  if (iconImport) {
    // Import the icon using lazy loading
    const IconComponent = lazy(iconImport);

    // Render the icon, with a fallback while it's loading
    return (
      <Suspense fallback={<Pending {...props}></Pending>}>
        <IconComponent {...props}></IconComponent>
      </Suspense>
    );
  }

  //If it doesn't exist, render the Missing icon
  return <Missing {...props}></Missing>;
};
