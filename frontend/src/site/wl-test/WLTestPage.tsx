import React, { useState } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';
import { Link } from 'react-router-dom';
import Breadcrumbs, { Breadcrumb, BreadcrumbsIconClass } from '../../components/Breadcrumbs';
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
  const [filesUploaded, setFilesUploaded] = useState(false);
  const { onDrop, errorMessage } = useUploadRequest({
    endpoint: '/api/upload/',
    onSuccess: () => setFilesUploaded(true),
  });

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'application/zip': ['.zip'], 'application/x-zip-compressed': ['.zip'] },
  });

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
            {filesUploaded
              ? UploadedView({ acceptedFiles })
              : DropzoneView({ getRootProps, getInputProps, isDragActive, errorMessage })}
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

      <div className="flex w-full items-center">
        <div className="btn btn-ghost">Perform test</div>
      </div>
    </>
  );
}

interface UploadedViewProps {
  acceptedFiles: FileWithPath[];
}
function UploadedView({ acceptedFiles }: UploadedViewProps) {
  return (
    <>
      <Description>Uploaded file: {acceptedFiles[0].path}</Description>
      <Margin>
        <Link to="results" className="btn btn-primary" state={{ filename: (acceptedFiles[0] as any).path }}>
          Perform test
        </Link>
      </Margin>
    </>
  );
}
