import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import clsx from 'clsx';
import { fetchSubmission } from '@kineticdata/react';
import { Button } from '../../../atoms/Button.jsx';
import { Icon } from '../../../atoms/Icon.jsx';
import { Modal } from '../../../atoms/Modal.jsx';
import { StatusPill } from '../../../components/tickets/StatusPill.jsx';
import { Error } from '../../../components/states/Error.jsx';
import { Loading } from '../../../components/states/Loading.jsx';
import { executeIntegration } from '../../../helpers/api.js';
import { callIfFn, timeAgo } from '../../../helpers/index.js';
import { getAttributeValue } from '../../../helpers/records.js';
import { toastError, toastSuccess } from '../../../helpers/toasts.js';
import { useData } from '../../../helpers/hooks/useData.js';
import { usePoller } from '../../../helpers/hooks/usePoller.js';

const parseActivityData = data => {
  if (!data) return data;
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
};

const createWorkNote = ({ kappSlug, id, note, onSuccess }) => {
  executeIntegration({
    kappSlug,
    integrationName: 'Create SNOW Incident Work Note',
    parameters: { id: id, note },
  }).then(response => {
    if (response.error) {
      toastError({ title: 'Failed to save the work note.' });
    } else {
      toastSuccess({ title: 'Work note added successfully.' });
      callIfFn(onSuccess);
    }
  });
};

const WorkNotes = ({ id }) => {
  const { kappSlug } = useSelector(state => state.app);
  const mobile = useSelector(state => state.view.mobile);
  // State for tracking if work notes section is open
  const [open, setOpen] = useState(false);

  // Parameters for the query (if null, the query will not run)
  const params = useMemo(
    () =>
      open
        ? {
            kappSlug,
            integrationName: 'Get SNOW Incident Work Notes',
            parameters: { id },
          }
        : null,
    [kappSlug, open, id],
  );

  // Retrieve the work notes
  const { initialized, loading, response, actions } = useData(
    executeIntegration,
    params,
  );
  const { Result: data } = response || {};
  const { reloadData } = actions;

  // State for adding new work notes
  const [newNote, setNewNote] = useState(null);

  if (id) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <Button
            variant="secondary"
            size="xs"
            onClick={() => setOpen(o => !o)}
          >
            <span>Work Notes</span>
            <Icon
              name={open ? 'chevron-up' : 'chevron-down'}
              size={mobile ? 20 : 24}
            />
          </Button>
          {open && (
            <Button
              variant="tertiary"
              size="xs"
              className="rounded-full p-1"
              onClick={reloadData}
              disabled={loading}
              aria-label="Refresh Work Notes"
            >
              <Icon name="refresh" size={mobile ? 16 : 20} />
            </Button>
          )}
        </div>
        {open && initialized && (
          <>
            {loading && <Loading size={28} xsmall />}
            {!loading && (!data || data.length === 0) && (
              <div className="bg-base-200 rounded-[7px] px-2 py-1.5 md:py-3 text-base-content/60 italic">
                There are no work notes.
              </div>
            )}
            {(data || []).map((note, i) => (
              <div
                key={`${note?.['Created On']}-${i}`}
                className="bg-base-200 rounded-[7px] px-2 py-1.5 md:py-3"
              >
                <div className="text-xs md:text-sm text-base-content/60 mb-2">
                  {timeAgo(note?.['Created On'])}
                </div>
                <div className="max-md:text-sm">{note?.['Value']}</div>
              </div>
            ))}
            <div className="flex justify-center mt-2">
              <Modal
                title="Add Work Note"
                open={newNote !== null}
                onOpenChange={({ open }) => setNewNote(open ? '' : null)}
                size="sm"
              >
                <Button slot="trigger" variant="secondary" size="sm">
                  Add Work Note
                </Button>
                <div slot="body" className="field">
                  <textarea
                    name="new-work-note"
                    rows="4"
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="New note"
                  />
                </div>
                <div slot="footer">
                  <Button
                    className="w-full"
                    variant="primary"
                    disabled={!newNote}
                    onClick={() =>
                      createWorkNote({
                        kappSlug,
                        id,
                        note: newNote,
                        onSuccess: () => {
                          setNewNote(null);
                          reloadData();
                        },
                      })
                    }
                  >
                    Save
                  </Button>
                </div>
              </Modal>
            </div>
          </>
        )}
      </div>
    );
  }
};

export const Activity = ({ first, last, mobile, icon, activity }) => {
  const data = parseActivityData(activity.data);
  const snowIncidentSysId = data?.['SNOW SYS ID'];
  const status =
    !data?.Status || ['Approved', 'Complete'].includes(data?.Status)
      ? true
      : ['Denied', 'Cancelled'].includes(data?.Status)
        ? false
        : null;

  return (
    <div
      className={clsx(
        // Common styles
        'relative bg-base-100 border border-base-300 rounded-[7px] shadow-card',
        'flex flex-col items-stretch',
        // Mobile first styles
        'px-2 py-3 ml-6 gap-3',
        // Non mobile styles
        'md:px-8 md:py-7 md:ml-20 md:gap-5',
      )}
    >
      <div
        className={clsx(
          'absolute w-1 bg-success',
          '-left-4',
          'md:-left-[3.875rem]',
          {
            'top-0': !first,
            'top-1/2': first,
            'h-0': first && last,
            'h-[calc(50%+1.875rem)]': first && !last,
            'h-[calc(100%+1.875rem)]': !first && !last,
            'h-1/2': !first && last,
          },
        )}
      />
      <div
        className={clsx(
          'absolute flex justify-center items-center',
          'border border-base-300 top-1/2 -translate-y-1/2 -left-6 w-5 h-5 rounded-[5px]',
          'md:-left-20 md:w-10 md:h-10 md:rounded-[10px]',
          {
            'bg-base-100 text-base-content': status === null,
            'bg-success text-success-content': status === true,
            'bg-warning text-warning-content': status === false,
          },
        )}
      >
        {icon && <Icon name={icon} size={mobile ? 12 : 24} />}
        {status === true && (
          <Icon
            name="circle-check"
            className="absolute -right-1 -bottom-1"
            size={mobile ? 12 : 16}
            filled
          />
        )}
        {status === false && (
          <Icon
            name="circle-x"
            className="absolute -right-1 -bottom-1"
            size={mobile ? 12 : 16}
            filled
          />
        )}
      </div>
      <div className="flex gap-3 items-center">
        <div className="flex-auto flex flex-col items-stretch gap-1 md:gap-2.5">
          {activity.createdAt && (
            <div className="text-xs md:text-sm text-base-content/60">
              {timeAgo(activity.createdAt)}
            </div>
          )}
          <div className="max-md:text-sm font-medium">{activity.label}</div>
        </div>
        {data?.Status && (
          <div
            className={clsx(
              'flex-none',
              // Mobile first styles
              'max-md:text-xs px-3 py-0.75 rounded-full font-medium text-center',
              // Non mobile styles
              'md:py-1.25 md:min-w-32',
              // Colors
              {
                'bg-base-300': status === null,
                'bg-success text-base-content': status === true,
                'bg-warning text-warning-content': status === false,
              },
            )}
          >
            {data?.Status}
          </div>
        )}
      </div>
      {data && (
        <div className="bg-base-200 rounded-[7px] px-2 py-1.5 md:py-3">
          {typeof data === 'string' ? (
            data
          ) : (
            <dl
              className="max-md:text-xs flex flex-wrap gap-3 md:gap-x-12"
              style={{ overflowWrap: 'anywhere' }}
            >
              {Object.entries(data).map(
                ([key, value]) =>
                  key !== 'Status' && (
                    <div key={key} className="flex flex-col gap-0.5 md:gap-1">
                      <dt className="text-base-content/60 font-medium">
                        {key}
                      </dt>
                      <dd>{value}</dd>
                    </div>
                  ),
              )}
            </dl>
          )}
        </div>
      )}
      {snowIncidentSysId && <WorkNotes id={snowIncidentSysId} />}
    </div>
  );
};

export const RequestDetail = () => {
  const { submissionId } = useParams();
  const mobile = useSelector(state => state.view.mobile);

  // Parameters for the query (if null, the query will not run)
  const params = useMemo(
    () => ({
      id: submissionId,
      include: 'activities,activities.details,details,form.attributesMap[Icon]',
    }),
    [submissionId],
  );

  // Retrieve the submission record
  const { initialized, loading, response, actions } = useData(
    fetchSubmission,
    params,
  );
  const { error, submission: data } = response || {};
  const { reloadData } = actions;

  const icon = getAttributeValue(
    data?.form,
    'Icon',
    data ? 'checklist' : 'blank',
  );

  // Start a poller to reload the submission regularly
  usePoller(reloadData);

  return (
    <>
      <div className="flex flex-col mt-4 mb-6 md:my-8">
        <div className="flex justify-between items-center gap-3 min-w-0">
          <div className="flex items-center gap-3">
            <Button
              variant="tertiary"
              icon="arrow-left"
              to=".."
              aria-label="Back"
            />
            <div className="md:h3 font-semibold line-clamp-3">
              {data?.label}
            </div>
            <span>{data && <StatusPill status={data.coreState} />}</span>
          </div>
          {!mobile && (
            <Button
              variant="tertiary"
              icon="file-check"
              to="review"
              className="whitespace-nowrap"
            >
              View Request
            </Button>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-screen-md">
        {initialized &&
          (error ? (
            <Error error={error} />
          ) : loading && !data ? (
            <Loading />
          ) : (
            <div
              className={clsx(
                'flex flex-col items-stretch gap-5 md:gap-7 py-3',
              )}
            >
              {data?.submittedAt && (
                <Activity
                  first={true}
                  last={!data?.closedAt && data?.activities?.length === 0}
                  icon={icon}
                  mobile={mobile}
                  activity={{
                    createdAt: data.submittedAt,
                    label: 'Request Submitted',
                    data: {
                      By: data.submittedBy,
                      Handle: data.handle,
                    },
                  }}
                />
              )}
              {(data?.activities || []).map((activity, index) => (
                <Activity
                  first={!data?.submittedAt && index === 0}
                  last={
                    !data?.closedAt && index === data?.activities?.length - 1
                  }
                  key={index}
                  icon={icon}
                  mobile={mobile}
                  activity={activity}
                />
              ))}
              {data?.closedAt && (
                <Activity
                  last={true}
                  icon={icon}
                  mobile={mobile}
                  activity={{
                    createdAt: data.closedAt,
                    label: 'Request Closed',
                  }}
                />
              )}
            </div>
          ))}
      </div>

      {mobile && (
        <div className="flex justify-center py-6 mt-auto">
          <Button
            variant="secondary"
            icon="file-check"
            to="review"
            className="whitespace-nowrap"
          >
            View Request
          </Button>
        </div>
      )}
    </>
  );
};
