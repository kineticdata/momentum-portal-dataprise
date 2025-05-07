import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import logo from '../../assets/images/logo-full.svg';
import { HeaderPortal } from './HeaderPortal.jsx';
import { Avatar } from '../../atoms/Avatar.jsx';
import { Menu } from '../../atoms/Menu.jsx';

export const ErrorHeader = () => {
  const { username, displayName } = useSelector(state => state.app.profile);

  const themeLogo = useSelector(state => state.theme.logo);

  return (
    <HeaderPortal>
      <nav className="stretch py-3 flex items-center gap-10 bg-base-100">
        <Link to="/" className="flex-none" aria-label="Home">
          <img
            src={themeLogo || logo}
            alt="Logo"
            className="h-10 max-w-45 object-contain"
          />
        </Link>
        <div className="mx-auto" />
        <Menu
          items={[
            displayName && { label: displayName, type: 'group' },
            { label: username, type: 'group' },
            { label: 'Logout', href: '/app/logout', icon: 'logout' },
          ].filter(Boolean)}
        >
          <button slot="trigger" className="kbtn kbtn-ghost kbtn-circle">
            <Avatar
              username={username}
              size="xl"
              className="flex-none"
              aria-label="User Menu"
            />
          </button>
        </Menu>
      </nav>
    </HeaderPortal>
  );
};
