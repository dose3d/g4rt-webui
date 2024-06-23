import cn from 'classnames';
import React, { useState } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs, { Breadcrumb, BreadcrumbsIconClass } from '../../components/Breadcrumbs';
import { CTextInput } from '../../components/forms';
import { ServerStackIcon } from '../../components/icons';
import {
  Card,
  CardHeader,
  CardHeaderMain,
  CardHeaderSubTitle,
  CardHeaderTitle,
  CardsContainer,
  Description,
  ErrorAlert,
  Margin,
  Page
} from '../../components/layout';
import { useUploadRequest } from '../../drf-crud-client';

export const WLTestPageBreadcrumbs: Breadcrumb[] = [
  { icon: <ServerStackIcon className={BreadcrumbsIconClass} />, label: 'WL Test', to: '/workspaces' },
];

export default function WLTestPage() {
  interface FormInput {
    bb_size: string;
    uploaded_file: string;
  }

  const { handleSubmit, control, setValue, watch, register, formState: { isValid } } = useForm<FormInput>();

  const [hashedFileName, setHashedFileName] = useState('');
  const navigate = useNavigate();
  const { onDrop, errorMessage } = useUploadRequest({
    endpoint: '/api/upload/',
    onSuccess: () => {
      setValue('uploaded_file', "true");
    },
  });

  async function computeChecksum(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop: async (acceptedFiles: File[]) => {
      acceptedFiles = await Promise.all(
        acceptedFiles.map(async (file) => new File([file], await computeChecksum(file))),
      );
      setHashedFileName(acceptedFiles[0].name);
      onDrop(acceptedFiles);
    },
    multiple: false,
    accept: { 'application/zip': ['.zip'], 'application/x-zip-compressed': ['.zip'] },
  });

  const onSubmit: SubmitHandler<FormInput> = (data) => navigate('/wl-test/results', { state: { filename: hashedFileName, data } });

  return (
    <Page>
      <Margin>
        <CardsContainer>
          <Card>
            <CardHeader>
              <CardHeaderMain>
                <Breadcrumbs breadcrumbs={WLTestPageBreadcrumbs} />
                <CardHeaderTitle>WL test Setup page</CardHeaderTitle>
                <CardHeaderSubTitle>To perform WL test upload zip file using field below.</CardHeaderSubTitle>
              </CardHeaderMain>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CTextInput name="bb_size" control={control} rules={{ required: true }} title="BB size [mm]" />

              {watch('uploaded_file') ? (
                <Description>Uploaded file: {(acceptedFiles[0] as FileWithPath).path}</Description>
              ) : (
                DropzoneView({ getRootProps, getInputProps, isDragActive, errorMessage })
              )}
              <input type="hidden" {...register('uploaded_file', { required: true })} />

              <button type="submit" className={cn('btn-primary btn')} disabled={!isValid}>
                Send
              </button>

              {!!errorMessage && <ErrorAlert className="my-4">{errorMessage}</ErrorAlert>}
            </form>
          </Card>
        </CardsContainer>
      </Margin>
    </Page>
  );
}

interface DropzoneViewProps {
  getRootProps: any;
  getInputProps: any;
  isDragActive: boolean;
  errorMessage: string | null;
}
function DropzoneView({ getRootProps, getInputProps, isDragActive, errorMessage }: DropzoneViewProps) {
  return (
    <>
      <div
        {...getRootProps()}
        className="mb-6 cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-gray-500"
      >
        <input {...getInputProps()} />
        <div className="text-center">
          {isDragActive ? (
            <p className="text-gray-600">Drop zip file here...</p>
          ) : (
            <p className="text-gray-600">{`Drag 'n' drop zip file, or click to select files.`}</p>
          )}
        </div>
      </div>
      {errorMessage && <ErrorAlert>{errorMessage}</ErrorAlert>}
    </>
  );
}
