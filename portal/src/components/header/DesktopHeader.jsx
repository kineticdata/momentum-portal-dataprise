import { Link, useMatch } from 'react-router-dom';
import { useSelector } from 'react-redux';
import logo from '../../assets/images/logo-full.svg';
import { Avatar } from '../../atoms/Avatar.jsx';
import { Button } from '../../atoms/Button.jsx';
import { HeaderPortal } from './HeaderPortal.jsx';
import { ServicesPanel } from '../services/ServicesPanel.jsx';
import { SearchModal } from '../search/SearchModal.jsx';
import { openConfirm } from '../../helpers/confirm.js';
import { updateSpace } from '@kineticdata/react';
import { toastError, toastSuccess } from '../../helpers/toasts.js';
import { appActions } from '../../helpers/state.js';
import { Icon } from '../../atoms/Icon.jsx';
import { Menu } from '../../atoms/Menu.jsx';
import { UserMenu } from './UserMenu.jsx';

export const DesktopHeader = () => {
  const matchesHome = useMatch('/');
  const username = useSelector(state => state.app.profile?.username);

  const themeLogo = useSelector(state => state.theme.logo);

  return (
    <HeaderPortal>
      <nav className="stretch py-3 flex items-center gap-5 lg:gap-10 bg-base-100">
        <Link to="/" className="flex-none" aria-label="Home">
          <img
            src={themeLogo || logo}
            alt="Logo"
            className="h-6 max-h-12 max-w-80 object-contain"
          />
        </Link>
        <Button variant="tertiary" to="requests">
          Tickets
        </Button>
        <div className="mx-auto" />
        {!matchesHome && (
          <SearchModal>
            <Button variant="tertiary" icon="search" aria-label="Open Search" />
          </SearchModal>
        )}
        <ServicesPanel>
          <Button variant="secondary" icon="file-plus">
            New Request
          </Button>
        </ServicesPanel>
        <UserMenu username={username} />
      </nav>
    </HeaderPortal>
  );
};
