import t from 'prop-types';
import { TabButton } from '../../atoms/Button.jsx';
import clsx from 'clsx';

export const TicketsTabs = ({
  className,
  active = 'requests',
  requestsProps: { label: requestsLabel = 'My Requests', ...requestsProps } = {
    to: '/requests',
    active: active === 'requests',
  },
  actionsProps: { label: actionsLabel = 'My Actions', ...actionsProps } = {
    to: '/actions',
    active: active === 'actions',
  },
}) => (
  <div
    className={clsx(
      // Mobile first styles
      'px-1 py-1 rounded-2xl flex gap-6 flex-none bg-base-300 max-md:self-center',
      // Non mobile styles
      'md:px-6 md:py-3 md:rounded-full md:gap-8',
      className,
    )}
  >
    <TabButton {...requestsProps}>{requestsLabel}</TabButton>
    <TabButton {...actionsProps}>{actionsLabel}</TabButton>
  </div>
);

TicketsTabs.propTypes = {
  active: t.oneOf(['requests', 'actions']),
  requestsProps: t.object,
  actionsProps: t.object,
};
