import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { SettingsHeading } from './Settings.jsx';
import { CoreForm, searchSubmissions } from '@kineticdata/react';
import { useData } from '../../helpers/hooks/useData.js';
import { Loading as Pending } from '../../components/states/Loading.jsx';
import { TableComponent } from '../../components/kinetic-form/widgets/table.js';
import { toastSuccess } from '../../helpers/toasts.js';
import clsx from 'clsx';
import { Error } from '../../components/states/Error.jsx';

const idToHandle = id =>
  !id ? null : id.toLowerCase() === 'new' ? 'New' : id.slice(-6).toUpperCase();

const rowTransform = ({ values, ...row }) => ({
  ...values,
  ...Object.fromEntries(Object.entries(row).map(([k, v]) => [`_${k}`, v])),
});

const dateFormat = dateString => format(new Date(dateString), 'PPPp');

export const DatastoreRecords = ({ datastores }) => {
  const { formSlug, id } = useParams();
  const navigate = useNavigate();
  const datastore = datastores?.find(form => form.slug === formSlug);

  const params = useMemo(
    () => ({
      kapp: 'datastore',
      form: formSlug,
      search: {
        include: ['details', 'values'],
        limit: 1000,
      },
    }),
    [formSlug],
  );

  const {
    initialized,
    loading,
    response,
    actions: { reloadData },
  } = useData(searchSubmissions, params);

  const handleCreated = useCallback(
    response => {
      reloadData();
      if (response.submission.coreState !== 'Submitted') {
        navigate(`./../${response.submission.id}`, {
          state: { persistToasts: true },
        });
      }
      if (response.submission.coreState === 'Draft') {
        toastSuccess({ title: 'Saved successfully.' });
      }
    },
    [navigate, reloadData],
  );

  const handleUpdated = useCallback(
    response => {
      reloadData();
      if (response.submission.coreState === 'Draft') {
        toastSuccess({ title: 'Saved successfully.' });
      } else {
        navigate('./..', { state: { persistToasts: true } });
      }
    },
    [navigate, reloadData],
  );

  const handleCompleted = useCallback(() => {
    reloadData();
    toastSuccess({ title: 'Saved successfully.' });
    navigate('./..', { state: { persistToasts: true } });
  }, [navigate, reloadData]);

  const crumbs = ['Datastore', datastore?.name, idToHandle(id)].filter(Boolean);
  const isLoading = !datastores || !initialized || (loading && !response);
  const showForm = typeof id === 'string';

  return (
    <>
      <SettingsHeading pageName={crumbs.join(' / ')} />

      {isLoading ? (
        <Pending />
      ) : (
        <>
          {showForm && (
            <div>
              <CoreForm
                submission={id !== 'new' ? id : undefined}
                kapp="datastore"
                form={formSlug}
                components={{ Pending }}
                created={handleCreated}
                updated={handleUpdated}
                completed={handleCompleted}
              />
            </div>
          )}

          {response.error || !datastore ? (
            <Error
              error={
                response.error || {
                  message: `Unable to locate the ${formSlug} Form.`,
                }
              }
            />
          ) : (
            <div className={clsx('-my-5 -mx-6 md:-mx-5', { hidden: showForm })}>
              <TableComponent
                data={response.submissions}
                rowTransform={rowTransform}
                columns={[
                  { label: 'Handle', property: '_handle' },
                  { label: 'Label', property: '_label' },
                  { label: 'Core State', property: '_coreState' },
                  ...datastore.fields.map(field => ({
                    label: field.name,
                    property: field.name,
                    visible: false,
                  })),
                  { label: 'ID', property: '_id', visible: false },
                  {
                    label: 'Created',
                    property: '_createdAt',
                    displayTransform: dateFormat,
                  },
                  {
                    label: 'Created By',
                    property: '_createdBy',
                    visible: false,
                  },
                  {
                    label: 'Updated',
                    property: '_updatedAt',
                    visible: false,
                    displayTransform: dateFormat,
                  },
                  {
                    label: 'Updated By',
                    property: '_updatedBy',
                    visible: false,
                  },
                  {
                    label: 'Submitted',
                    property: '_submittedAt',
                    visible: false,
                    displayTransform: dateFormat,
                  },
                  {
                    label: 'Submitted By',
                    property: '_submittedBy',
                    visible: false,
                  },
                  {
                    label: 'Closed',
                    property: '_closedAt',
                    visible: false,
                    displayTransform: dateFormat,
                  },
                  { label: 'Closed By', property: '_closedBy', visible: false },
                ]}
                addAction={
                  datastore.authorization.Display
                    ? {
                        label: 'New Record',
                        onClick: () => navigate('new'),
                      }
                    : undefined
                }
                selectAction={{
                  label: 'View Record',
                  onClick: row => navigate(row._id),
                }}
                allowExport={false}
              />
            </div>
          )}
        </>
      )}
    </>
  );
};
