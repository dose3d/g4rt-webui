import React, { useCallback } from 'react';
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
import { UploadFileSuccessCallback, useFormatErrorToString } from '../../drf-crud-client';
import Breadcrumbs, { Breadcrumb, BreadcrumbsIconClass } from '../../components/Breadcrumbs';
import { RootFilesPagePageBreadcrumbs } from './RootFilesPage';
import { DocumentPlusIcon } from '../../components/icons';
import { useRootFileForm } from '../../api/rootFile';
import UploadFile from '../../components/UploadFile';

const RootFileCreatePageBreadcrumbs: Breadcrumb[] = [
  ...RootFilesPagePageBreadcrumbs,
  {
    icon: <DocumentPlusIcon className={BreadcrumbsIconClass} />,
    label: 'Upload new user file',
    to: '/rf/create',
  },
];

export default function RootFileCreatePage() {
  const navigate = useNavigate();
  const formatErrorToString = useFormatErrorToString();
  const {
    handleSubmitShort,
    form: { control, setValue, watch, register },
    cud: { isLoading, failureReason },
  } = useRootFileForm({
    formProps: { defaultValues: { title: '', description: '' }, reValidateMode: 'onSubmit' },
    onSuccess: () => navigate('/rf'),
  });

  const onSuccess = useCallback<UploadFileSuccessCallback>(
    (response) => {
      if (!watch('title')) {
        setValue('title', response.data.file.substring('/uploads/'.length));
      }
      setValue('uploaded_file', response.data.id);
    },
    [setValue, watch],
  );

  return (
    <Page>
      <Margin>
        <CardsContainer>
          <Card>
            <CardHeader>
              <CardHeaderMain>
                <Breadcrumbs breadcrumbs={RootFileCreatePageBreadcrumbs} />
                <CardHeaderTitle>Upload a user file</CardHeaderTitle>
                <CardHeaderSubTitle>
                  After upload, the new user file will be available for use in workspaces cells.
                </CardHeaderSubTitle>
              </CardHeaderMain>
            </CardHeader>
            <form onSubmit={handleSubmitShort}>
              <input type="hidden" {...register('uploaded_file')} />

              {watch('uploaded_file') ? (
                <>
                  <CTextInput name="title" control={control} title="User file name" inputProps={{ readOnly: true }} />
                  <CTextArea name="description" control={control} title="Description of the user file" />
                  <button type="submit" className={cn('btn-primary btn', { loading: isLoading })} disabled={isLoading}>
                    Send
                  </button>
                </>
              ) : (
                <>
                  <UploadFile endpoint="/api/upload/" onSuccess={onSuccess} />
                  <input type="hidden" {...register('title')} />
                </>
              )}

              {!!failureReason && <ErrorAlert className="my-4">{formatErrorToString(failureReason)}</ErrorAlert>}
            </form>
          </Card>
        </CardsContainer>
      </Margin>
    </Page>
  );
}
