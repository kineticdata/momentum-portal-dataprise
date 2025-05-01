import { Avatar } from '../../atoms/Avatar.jsx';
import { Menu } from '../../atoms/Menu.jsx';

export const UserMenu = ({ username, size = 'xl' }) => (
  <Menu
    items={[
      { label: 'Profile', to: '/profile', icon: 'user' },
      { label: 'Settings', to: '/settings', icon: 'settings' },
      { type: 'divider' },
      { label: 'Logout', href: '/app/logout', icon: 'logout' },
    ]}
  >
    <button slot="trigger" className="kbtn kbtn-ghost kbtn-circle">
      <Avatar
        username={username}
        size={size}
        className="flex-none"
        aria-label="User Menu"
      />
    </button>
  </Menu>
);
