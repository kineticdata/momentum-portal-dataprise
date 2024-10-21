import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CoreForm } from '@kineticdata/react';
import { valuesFromQueryParams } from '../../helpers/index.js';

export const KineticForm = props => {
  const { kappSlug, formSlug, submissionId, isEditMode } = props;
  const [searchParams] = useSearchParams();
  const [kapp, setKapp] = useState(kappSlug);
  const [form, setForm] = useState(formSlug);
  const paramFieldValues = valuesFromQueryParams(searchParams);
  const navigate = useNavigate();

  // if only a submissionId was passed in, set the Kapp Slug
  // and Form Slug used for redirecting
  const handleLoaded = () => form => {
    setForm(form.slug());
    setKapp(form.kapp().slug());
  };

  const Pending = () => <div>loading...</div>;

  const handleRedirect = () => response => {
    if (response.submission.displayedPage?.type !== 'confirmation') {
      // TODO navigate to activity page
    }
  };

  return submissionId ? (
    <CoreForm
      submission={submissionId}
      review={isEditMode}
      onLoaded={handleLoaded()}
      onUpdated={handleRedirect()}
      onCompleted={handleRedirect()}
      components={{ Pending, ...props.components }}
      {...props}
    />
  ) : (
    <CoreForm
      kapp={kapp}
      form={form}
      onCompleted={handleRedirect()}
      values={paramFieldValues || props.values}
      components={{ Pending, ...props.components }}
      {...props}
    />
  );
};
