import React from 'react';
import cn from 'classnames';
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
import { RootFilesPagePageBreadcrumbs } from './RootFilesPage';
import { DocumentPlusIcon } from '../../components/icons';
import { useJobRootFileList } from '../../api/jobsRootFile';
import { useRootFileForm } from '../../api/rootFile';

const RootFileCreatePageBreadcrumbs: Breadcrumb[] = [
  ...RootFilesPagePageBreadcrumbs,
  {
    icon: <DocumentPlusIcon className={BreadcrumbsIconClass} />,
    label: 'Upload new ROOT file',
    to: '/rf/create',
  },
];

export default function RootFileCreatePage() {
  const navigate = useNavigate();
  const formatErrorToString = useFormatErrorToString();
  const { data } = useJobRootFileList();
  const {
    handleSubmitShort,
    form: { control },
    cud: { isLoading, failureReason },
  } = useRootFileForm({
    formProps: { defaultValues: { title: '', description: '' }, reValidateMode: 'onSubmit' },
    onSuccess: () => navigate('/rf'),
  });

  return (
    <Page>
      <Margin>
        <CardsContainer>
          <Card>
            <CardHeader>
              <CardHeaderMain>
                <Breadcrumbs breadcrumbs={RootFileCreatePageBreadcrumbs} />
                <CardHeaderTitle>Upload a ROOT file</CardHeaderTitle>
                <CardHeaderSubTitle>
                  After upload, the new ROOT file will be available for use in workspaces cells.
                </CardHeaderSubTitle>
              </CardHeaderMain>
            </CardHeader>
            <form onSubmit={handleSubmitShort}>
              <CTextInput name="title" control={control} title="ROOT file name" />
              <CTextArea name="description" control={control} title="Description of the ROOT file" />
              <div>
                <input type="file" />
                TODO: upload currently not working, its only mock-up
              </div>
              <button type="submit" className={cn('btn-primary btn', { loading: isLoading })} disabled={isLoading}>
                Send
              </button>
              {!!failureReason && <ErrorAlert className="my-4">{formatErrorToString(failureReason)}</ErrorAlert>}
            </form>
          </Card>
        </CardsContainer>
      </Margin>
    </Page>
  );
}
