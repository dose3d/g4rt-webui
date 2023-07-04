import React from 'react';
import cn from 'classnames';
import { useWorkspaceForm } from '../../api/workspaces';
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
import { WorkspacesPageBreadcrumbs } from './WorkspacesPage';
import { DocumentPlusIcon } from '../../components/icons';

const WorkspaceCreatePageBreadcrumbs: Breadcrumb[] = [
  ...WorkspacesPageBreadcrumbs,
  {
    icon: <DocumentPlusIcon className={BreadcrumbsIconClass} />,
    label: 'New workspace',
    to: '/workspaces/create',
  },
];

export default function WorkspaceCreatePage() {
  const navigate = useNavigate();
  const formatErrorToString = useFormatErrorToString();
  const {
    handleSubmitShort,
    form: { control },
    cud: { isLoading, failureReason },
  } = useWorkspaceForm({
    formProps: { defaultValues: { title: '', description: '' }, reValidateMode: 'onSubmit' },
    onSuccess: () => navigate('/workspaces'),
  });

  return (
    <Page>
      <Margin>
        <CardsContainer>
          <Card>
            <CardHeader>
              <CardHeaderMain>
                <Breadcrumbs breadcrumbs={WorkspaceCreatePageBreadcrumbs} />
                <CardHeaderTitle>Create a new workspace</CardHeaderTitle>
                <CardHeaderSubTitle>
                  After create, the new workspace will be opened for view and edit cells.
                </CardHeaderSubTitle>
              </CardHeaderMain>
            </CardHeader>
            <form onSubmit={handleSubmitShort}>
              <CTextInput name="title" control={control} title="Workspace title" />
              <CTextArea name="description" control={control} title="Description of the workspace" />

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