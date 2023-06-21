import React from 'react';
import cn from 'classnames';
import { useJobCreateUpdate } from '../../api/jobs';
import {
  Card,
  CardHeader,
  CardHeaderMain,
  CardHeaderSubTitle,
  CardHeaderTitle,
  CardsContainer,
  ErrorAlert,
  Margin,
  Page,
} from '../../components/layout';
import { CTextArea, CTextInput } from '../../components/forms';
import { useNavigate } from 'react-router-dom';
import { useFormatErrorToString } from '../../drf-crud-client';
import Breadcrumbs, { Breadcrumb, BreadcrumbsIconClass } from '../../components/Breadcrumbs';
import { JobsPageBreadcrumbs } from './JobsPage';
import { DocumentPlusIcon } from '../../components/icons';

const JobCreatePageBreadcrumbs: Breadcrumb[] = [
  ...JobsPageBreadcrumbs,
  {
    icon: <DocumentPlusIcon className={BreadcrumbsIconClass} />,
    label: 'New job',
    to: '/jobs/create',
  },
];

export default function JobCreatePage() {
  const navigate = useNavigate();
  const formatErrorToString = useFormatErrorToString();
  const {
    handleSubmitShort,
    form: { control },
    createUpdate: { isLoading, lastError },
  } = useJobCreateUpdate({
    formProps: { defaultValues: { title: '', description: '' }, reValidateMode: 'onSubmit' },
    cudProps: { onSuccess: () => navigate('/jobs') },
  });

  return (
    <Page>
      <Margin>
        <CardsContainer>
          <Card>
            <CardHeader>
              <CardHeaderMain>
                <Breadcrumbs breadcrumbs={JobCreatePageBreadcrumbs} />
                <CardHeaderTitle>Create a new job</CardHeaderTitle>
                <CardHeaderSubTitle>
                  After create, the new job will be added to queue. You can remove job from queue or break pending job.
                </CardHeaderSubTitle>
              </CardHeaderMain>
            </CardHeader>
            <form onSubmit={handleSubmitShort}>
              <CTextInput name="title" control={control} title="Job title" />
              <CTextArea name="description" control={control} title="Description of the job" />
              <CTextInput name="args" control={control} title="Command line arguments for Dose3D" />
              <CTextArea
                name="toml"
                control={control}
                title="Paste TOML file content here"
                height="h-96"
                inputCN="font-mono leading-tight"
              />
              <button type="submit" className={cn('btn-primary btn', { loading: isLoading })} disabled={isLoading}>
                Send
              </button>

              {!!lastError && <ErrorAlert className="my-4">{formatErrorToString(lastError)}</ErrorAlert>}
            </form>
          </Card>
        </CardsContainer>
      </Margin>
    </Page>
  );
}
