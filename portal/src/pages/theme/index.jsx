import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ColorField } from '../../atoms/ColorField.jsx';

import styles from '../../assets/styles/daisyui/theme.css?inline';
import { Icon } from '../../atoms/Icon.jsx';
import clsx from 'clsx';
import {
  Button,
  CategoryButton,
  ChipButton,
  CloseButton,
  PopularServiceButton,
} from '../../atoms/Button.jsx';
import { TicketsTabs } from '../../components/tickets/TicketsTabs.jsx';
import {
  HomeTicketCard,
  TicketCard,
} from '../../components/tickets/TicketCard.jsx';
import { ShortcutLink } from '../../components/home/ShortcutsSection.jsx';
import { callIfFn } from '../../helpers/index.js';
import { Tooltip } from '../../atoms/Tooltip.jsx';
import { StatusDot } from '../../components/tickets/StatusPill.jsx';
import { produce } from 'immer';
import { Avatar } from '../../atoms/Avatar.jsx';
import { ServiceCard } from '../../components/services/ServiceCard.jsx';
import { Activity } from '../tickets/requests/RequestDetail.jsx';

const initialTheme = Array.from(
  styles.matchAll(/--theme-([a-z\d-]+):\s*(#[a-f\d]{6})/g),
).reduce((r, [, k, v]) => ({ ...r, [k]: v }), {});

const sameColor = (a, b) => !a || a.toLowerCase() === b?.toLocaleString();

const ThemeBadge = ({ color, theme, chevron = true }) => (
  <div
    className={clsx(
      `kbadge kbadge-${color} kbadge-xl border-none font-semibold shadow-sm justify-between`,
      { 'w-full': chevron, 'flex-none': !chevron },
    )}
    style={{
      ...(color === 'base'
        ? {
            backgroundImage: `linear-gradient(108deg, ${theme?.['base-100']} 33%, ${theme?.['base-200']} 34%, ${theme?.['base-200']} 66%, ${theme?.['base-300']} 67%)`,
          }
        : {
            backgroundColor: theme?.[color],
          }),
      color: theme?.[`${color}-content`],
    }}
  >
    {color.toUpperCase()}
    {chevron && (
      <Icon
        name="chevron-right"
        alt=""
        className="flex-none group-open:hidden"
      />
    )}
    {chevron && (
      <Icon
        name="chevron-down"
        alt=""
        className="flex-none group-not-open:hidden"
      />
    )}
  </div>
);

const ThemeColor = ({ color, theme, themeSetters }) => {
  return (
    <details className="group">
      <summary className="block cursor-pointer">
        <ThemeBadge color={color} theme={theme} />
      </summary>

      <div className="layout-column gap-3 border-l-2 border-base-300 mt-3 pl-2 mb-5">
        {color === 'base' ? (
          <>
            <div className="field">
              <label htmlFor={`${color}-100-field`}>Base 100</label>
              <ColorField
                id={`${color}-100-field`}
                value={theme?.[`${color}-100`]}
                defaultValue={initialTheme?.[`${color}-100`]}
                onChange={themeSetters?.[`${color}-100`]}
                alignment="start"
              ></ColorField>
            </div>
            <div className="field">
              <label htmlFor={`${color}-200-field`}>Base 200</label>
              <ColorField
                id={`${color}-200-field`}
                value={theme?.[`${color}-200`]}
                defaultValue={initialTheme?.[`${color}-200`]}
                onChange={themeSetters?.[`${color}-200`]}
                alignment="start"
              ></ColorField>
            </div>
            <div className="field">
              <label htmlFor={`${color}-300-field`}>Base 300</label>
              <ColorField
                id={`${color}-300-field`}
                value={theme?.[`${color}-300`]}
                defaultValue={initialTheme?.[`${color}-300`]}
                onChange={themeSetters?.[`${color}-300`]}
                alignment="start"
              ></ColorField>
            </div>
          </>
        ) : (
          <div className="field">
            <label htmlFor={`${color}-field`}>Color</label>
            <ColorField
              id={`${color}-field`}
              value={theme?.[color]}
              defaultValue={initialTheme?.[color]}
              onChange={themeSetters?.[color]}
              alignment="start"
            ></ColorField>
          </div>
        )}
        <div className="field">
          <label htmlFor={`${color}-content-field`}>Content</label>
          <ColorField
            id={`${color}-content-field`}
            value={theme?.[`${color}-content`]}
            defaultValue={initialTheme?.[`${color}-content`]}
            onChange={themeSetters?.[`${color}-content`]}
            alignment="start"
          ></ColorField>
        </div>
      </div>
    </details>
  );
};

export const Theme = () => {
  return (
    <div className="flex flex-col gap-6 my-8">
      <h1>Theme Builder</h1>
      <ThemePreview onEdit={() => {}} />
      <hr />
      <ThemeBuilder />
    </div>
  );
};

export const ThemePreview = ({ themeData, onEdit, disabled }) => {
  const theme = { ...initialTheme, ...themeData };
  return (
    <div className="layout-row gap-3 flex-wrap">
      <ThemeBadge color="base" theme={theme} chevron={false} />
      <ThemeBadge color="primary" theme={theme} chevron={false} />
      <ThemeBadge color="secondary" theme={theme} chevron={false} />
      <ThemeBadge color="accent" theme={theme} chevron={false} />
      <ThemeBadge color="neutral" theme={theme} chevron={false} />
      <ThemeBadge color="info" theme={theme} chevron={false} />
      <ThemeBadge color="success" theme={theme} chevron={false} />
      <ThemeBadge color="warning" theme={theme} chevron={false} />
      <ThemeBadge color="error" theme={theme} chevron={false} />
      {onEdit && !disabled && (
        <Tooltip content="Edit Theme" position="top" alignment="middle">
          <Button
            slot="trigger"
            variant="secondary"
            icon="brush"
            aria-label="Edit Theme"
            onClick={onEdit}
          />
        </Tooltip>
      )}
    </div>
  );
};

export const ThemeBuilder = ({
  themeData,
  updateThemeData,
  onSave,
  className,
}) => {
  const ref = useRef();
  const [theme, setTheme] = useState(
    typeof themeData === 'object' ? themeData : {},
  );

  useEffect(() => {
    callIfFn(updateThemeData, null, [
      Object.fromEntries(
        Object.entries(theme).filter(
          ([k, v]) => !sameColor(v, initialTheme[k]),
        ),
      ),
    ]);
  }, [theme, updateThemeData]);

  const updateTheme = useCallback((name, color) => {
    setTheme(t => ({ ...t, [name]: color }));
    ref.current.style.setProperty(`--new-theme-${name}`, color);
  }, []);

  const resetTheme = useCallback(() => {
    setTheme(initialTheme);
    Object.keys(initialTheme).forEach(name => {
      ref.current.style.setProperty(
        `--new-theme-${name}`,
        initialTheme?.[name],
      );
    });
  }, []);

  const setters = useMemo(
    () =>
      Object.keys(initialTheme).reduce(
        (r, name) => ({ ...r, [name]: color => updateTheme(name, color) }),
        {},
      ),
    [updateTheme],
  );

  return (
    <div className={clsx('flex gap-8 max-md:flex-col h-full', className)}>
      <div className="flex-initial layout-column basis-3xs py-6 gap-3">
        <div className="layout-column flex-auto gap-3 mb-3 pr-2 md:overflow-auto">
          <ThemeColor color="base" theme={theme} themeSetters={setters} />
          <ThemeColor color="primary" theme={theme} themeSetters={setters} />
          <ThemeColor color="secondary" theme={theme} themeSetters={setters} />
          <ThemeColor color="accent" theme={theme} themeSetters={setters} />
          <ThemeColor color="neutral" theme={theme} themeSetters={setters} />
          <ThemeColor color="info" theme={theme} themeSetters={setters} />
          <ThemeColor color="success" theme={theme} themeSetters={setters} />
          <ThemeColor color="warning" theme={theme} themeSetters={setters} />
          <ThemeColor color="error" theme={theme} themeSetters={setters} />
        </div>
        <Button
          variant="secondary"
          size="md"
          onClick={resetTheme}
          className="mt-auto"
        >
          Reset Theme
        </Button>
        {onSave && (
          <Button variant="primary" size="md" onClick={() => onSave(theme)}>
            Save Theme
          </Button>
        )}
      </div>
      <div
        ref={ref}
        className="bg-base-200 text-base-content rounded-box md:overflow-auto w-full"
        style={Object.keys(initialTheme).reduce(
          (r, k) => ({
            ...r,
            [`--color-${k}`]: `oklch(from var(--new-theme-${k}, var(--theme-${k})) l c h)`,
          }),
          {},
        )}
      >
        <div className="2xl:columns-3 lg:columns-2 gap-6 p-6 pb-12 ">
          <FormExample />
          <PopularCardExample />
          <ToastExample />
          <CategoryAndAvatarExample />
          <ServiceCardExample />
          <FilterExample />
          <ActivityExample />
          <TicketsExample />
          <ShortcutCardExample />
          <AlertsExample />
          <TicketsHomeExample />
        </div>
      </div>
    </div>
  );
};

const exampleClasses = 'layout-column break-inside-avoid mb-6';
const borderedExampleClasses = clsx(
  exampleClasses,
  'bg-base-100 border rounded-box shadow-card',
);

const FormExample = () => (
  <div
    className={clsx(
      borderedExampleClasses,
      'bg-neutral text-neutral-content border-none rounded-b-4xl',
    )}
  >
    <div className="p-4 layout-column-center gap-3">
      <div className="self-stretch layout-row-between gap-3">
        <span className="flex-1">
          <Button variant="tertiary" aria-label="Back" icon="arrow-left" />
        </span>
        <div className="bg-neutral-content text-neutral rounded-[10px] shadow-icon flex-none p-2.25">
          <Icon name="forms" />
        </div>
        <span className="flex-1 text-right">
          <Button variant="tertiary" aria-label="Delete" icon="trash" />
        </span>
      </div>
      <div className="text-h3 font-semibold text-center text-balance">
        Request Form
      </div>
    </div>
    <div className="p-6 text-base-content layout-column gap-3 bg-base-100 rounded-box">
      <div className="field">
        <label htmlFor="form-text-field">Text</label>
        <input type="text" id="form-text-field" placeholder="Placeholder" />
      </div>
      <div className="field checkbox">
        <label htmlFor="form-checkbox-field">Checkbox</label>
        <label htmlFor="form-checkbox-field-1">
          <input type="checkbox" id="form-checkbox-field-1" /> Blue
        </label>
        <label htmlFor="form-checkbox-field-2">
          <input type="checkbox" id="form-checkbox-field-2" /> Green
        </label>
      </div>
      <div className="field radio">
        <label htmlFor="form-radio-field">Radio</label>
        <label htmlFor="form-radio-field-1">
          <input type="radio" name="form-radio-field" id="form-radio-field-1" />{' '}
          Left
        </label>
        <label htmlFor="form-radio-field-2">
          <input type="radio" name="form-radio-field" id="form-radio-field-2" />{' '}
          Right
        </label>
      </div>
      <div className="layout-row gap-4 mt-4">
        <Button variant="secondary">Save</Button>
        <Button variant="primary">Submit</Button>
      </div>
    </div>
  </div>
);

const TicketsHomeExample = () => {
  const [tab, setTab] = useState('requests');
  return (
    <div className={clsx(exampleClasses)}>
      <div className="flex justify-center mb-4">
        <TicketsTabs
          active={tab}
          requestsProps={{
            onClick: () => setTab('requests'),
            active: tab === 'requests',
            label: 'Requests',
          }}
          actionsProps={{
            onClick: () => setTab('actions'),
            active: tab === 'actions',
            label: 'Actions',
          }}
        />
      </div>
      <div className="flex flex-col items-stretch">
        <HomeTicketCard
          submission={
            tab === 'requests'
              ? {
                  id: 1,
                  label: 'Building Access Request',
                  type: 'Service',
                  coreState: 'Closed',
                  closedAt: new Date().toDateString(),
                }
              : {
                  id: 1,
                  label: 'Onboarding Approval',
                  type: 'Approval',
                  coreState: 'Submitted',
                  submittedAt: new Date().toDateString(),
                }
          }
        />
        <HomeTicketCard
          submission={
            tab === 'requests'
              ? {
                  id: 2,
                  label: 'Hardware Request',
                  type: 'Service',
                  coreState: 'Submitted',
                  submittedAt: new Date().toDateString(),
                }
              : {
                  id: 2,
                  label: 'Reset Password Task',
                  type: 'Task',
                  coreState: 'Draft',
                  createdAt: new Date().toDateString(),
                }
          }
        />
        {tab === 'requests' && (
          <HomeTicketCard
            submission={{
              id: 3,
              label: 'Software Request',
              type: 'Service',
              coreState: 'Draft',
              createdAt: new Date().toDateString(),
            }}
          />
        )}
      </div>
    </div>
  );
};

const TicketsExample = () => {
  return (
    <div className={clsx(exampleClasses)}>
      <div className="flex flex-col gap-4 md:grid md:grid-cols-[auto_2fr_1fr_auto]">
        <TicketCard
          mobile={true}
          submission={{
            id: 1,
            label: 'Building Access Request',
            type: 'Service',
            coreState: 'Closed',
            closedAt: new Date().toDateString(),
          }}
        />
        <TicketCard
          mobile={true}
          submission={{
            id: 2,
            label: 'Software Request',
            type: 'Service',
            coreState: 'Submitted',
            submittedAt: new Date().toDateString(),
          }}
        />

        <div className="col-start-1 col-end-5 py-2.5 px-6 flex justify-center items-center gap-6 bg-base-100 rounded-xl shadow-card min-h-16">
          <Button variant="secondary" disabled={true} icon="chevron-left">
            Previous
          </Button>
          <div className="flex justify-center items-center w-11 h-11 bg-accent text-accent-content rounded-full font-semibold">
            1
          </div>
          <Button variant="secondary" iconEnd="chevron-right">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

const PopularCardExample = () => {
  return (
    <div className={clsx(exampleClasses)}>
      <PopularServiceButton icon="brand-github" category="Access">
        Github Access
      </PopularServiceButton>
    </div>
  );
};

const CategoryAndAvatarExample = () => {
  return (
    <div
      className={clsx(
        exampleClasses,
        '!flex-row justify-center items-center gap-12',
      )}
    >
      <CategoryButton icon="category">IT Category</CategoryButton>
      <Avatar username="wally@kineticdata.com" size="3xl" />
    </div>
  );
};

const AlertsExample = () => {
  return (
    <div className={clsx(exampleClasses, 'gap-3')}>
      <div className="kalert kalert-info">
        <Icon name="info-circle" />
        <span className="font-medium">Informational Alert</span>
      </div>
      <div className="kalert kalert-warning">
        <Icon name="alert-square-rounded" />
        <span className="font-medium">Warning Alert</span>
      </div>
    </div>
  );
};

const ServiceCardExample = () => {
  return (
    <div className={clsx(exampleClasses, '')}>
      <ServiceCard
        form={{
          name: 'Laptop Request',
          description: 'Request a laptop computer.',
          attributesMap: { Icon: ['device-laptop'] },
        }}
      />
    </div>
  );
};

const ShortcutCardExample = () => {
  return (
    <div className={clsx(exampleClasses, '!flex-row')}>
      <ShortcutLink
        title="External Admin Console"
        description="Manage external dependencies and resources."
        icon="terminal-2"
        className="!w-full"
      />
    </div>
  );
};

const ToastExample = () => {
  return (
    <div className={clsx(exampleClasses, 'gap-3')}>
      <div
        className={clsx(
          'flex flex-col items-stretch gap-3 pl-5 pr-1.5 py-3',
          'rounded-box shadow-card overflow-hidden',
          'min-w-80 max-w-[calc(100vw-3rem)] md:max-w-screen-sm',
          'bg-success text-success-content',
        )}
      >
        <div className="flex items-center gap-3">
          <Icon
            name={clsx('circle-check-filled')}
            className={clsx('flex-none')}
          />
          <div className="flex-auto font-medium">Success Toast</div>
          <CloseButton size="sm" className="flex-none ml-auto -my-1.5" />
        </div>
      </div>

      <div
        className={clsx(
          'flex flex-col items-stretch gap-3 pl-5 pr-1.5 py-3',
          'rounded-box shadow-card overflow-hidden',
          'min-w-80 max-w-[calc(100vw-3rem)] md:max-w-screen-sm',
          'bg-error text-error-content',
        )}
      >
        <div className="flex items-center gap-3">
          <Icon
            name={clsx('exclamation-circle-filled')}
            className={clsx('flex-none')}
          />
          <div className="flex-auto font-medium">Error Toast</div>
          <CloseButton size="sm" className="flex-none ml-auto -my-1.5" />
        </div>
        <div className="whitespace-pre-wrap">Description of error</div>
      </div>
    </div>
  );
};

const FilterExample = () => {
  // Temp filters to use while the panel/popover is open that we can then apply
  const [tempFilters, setTempFilters] = useState({
    assignment: { mine: false, teams: false },
    status: { open: false, closed: false, draft: false },
  });
  // Handler for changing individual temp filter values
  const handleTempFilterChange = useCallback(
    (name, property, value) => () => {
      setTempFilters(f =>
        produce(f, f => {
          f[name][property] = value;
        }),
      );
    },
    [],
  );
  // Handler to reset all filters to false so we show all records
  const handleTempFilterClearAll = useCallback(() => {
    setTempFilters(f =>
      produce(f, f => {
        Object.keys(f).forEach(name =>
          Object.keys(f[name]).forEach(property => {
            f[name][property] = false;
          }),
        );
      }),
    );
  }, []);
  // Are all temp filter values unset
  const hasNoneTemp =
    !Object.values(tempFilters.assignment || {}).some(v => v) &&
    !Object.values(tempFilters.status || {}).some(v => v);

  return (
    <div className={clsx(borderedExampleClasses, 'p-5 gap-3')}>
      <div className="flex justify-between items-center gap-3">
        <span className="h3">Filter</span>
        <CloseButton />
      </div>

      <div className="px-4 pt-1 pb-3 flex flex-col gap-4 border-b border-base-300">
        <div className="flex gap-5 flex-wrap">
          <ChipButton
            active={hasNoneTemp}
            icon={hasNoneTemp ? 'check' : null}
            onClick={handleTempFilterClearAll}
            disabled={hasNoneTemp}
            className="disabled:text-base-content"
          >
            All Tickets
          </ChipButton>
        </div>
      </div>

      <div className="px-4 pt-1 pb-3 flex flex-col gap-4 border-b border-base-300">
        <span className="font-medium">Assigned to</span>
        <div className="flex gap-5 flex-wrap">
          <ChipButton
            active={tempFilters.assignment.mine}
            icon={tempFilters.assignment.mine ? 'check' : null}
            onClick={handleTempFilterChange(
              'assignment',
              'mine',
              !tempFilters.assignment.mine,
            )}
          >
            Me
          </ChipButton>
          <ChipButton
            active={tempFilters.assignment.teams}
            icon={tempFilters.assignment.teams ? 'check' : null}
            onClick={handleTempFilterChange(
              'assignment',
              'teams',
              !tempFilters.assignment.teams,
            )}
          >
            My teams
          </ChipButton>
        </div>
      </div>

      <div className="px-4 pt-1 pb-3 flex flex-col gap-4">
        <span className="font-medium">Status</span>
        <div className="flex gap-5 flex-wrap">
          <ChipButton
            active={tempFilters.status.open}
            icon={tempFilters.status.open ? 'check' : null}
            onClick={handleTempFilterChange(
              'status',
              'open',
              !tempFilters.status.open,
            )}
          >
            Open
            <StatusDot status="Open" />
          </ChipButton>
          <ChipButton
            active={tempFilters.status.closed}
            icon={tempFilters.status.closed ? 'check' : null}
            onClick={handleTempFilterChange(
              'status',
              'closed',
              !tempFilters.status.closed,
            )}
          >
            Closed
            <StatusDot status="Closed" />
          </ChipButton>
          <ChipButton
            active={tempFilters.status.draft}
            icon={tempFilters.status.draft ? 'check' : null}
            onClick={handleTempFilterChange(
              'status',
              'draft',
              !tempFilters.status.draft,
            )}
          >
            Draft
            <StatusDot status="Draft" />
          </ChipButton>
        </div>
      </div>

      <Button variant="primary" size="md" className="mt-auto">
        Show Results
      </Button>
    </div>
  );
};

const ActivityExample = () => {
  return (
    <div className={clsx(exampleClasses, 'gap-5')}>
      <Activity
        first={true}
        icon="device-laptop"
        activity={{
          createdAt: new Date().getTime(),
          label: 'Request Submitted',
          data: { By: 'Robert Requester' },
        }}
      />
      <Activity
        last={true}
        icon="device-laptop"
        activity={{
          createdAt: new Date().getTime(),
          label: 'Awaiting Approval',
          data: {
            Status: 'In Progress',
            Approver: 'Allan Approver',
          },
        }}
      />
    </div>
  );
};
