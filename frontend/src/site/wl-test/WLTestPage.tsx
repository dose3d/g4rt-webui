import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
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
  const [hashedFileName, setHashedFileName] = useState('');
  const { onDrop, errorMessage } = useUploadRequest({
    endpoint: '/api/upload/',
    onSuccess: () => setFilesUploaded(true),
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
              ? UploadedView({ filename: hashedFileName })
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
        <button disabled className="btn">Perform test</button>
      </div>
    </>
  );
}

interface UploadedViewProps {
  filename: string;
}
function UploadedView({ filename }: UploadedViewProps) {
  return (
    <>
      <Description>Uploaded file: {filename}</Description>
      <Margin>
        <Link to="results" className="btn btn-primary" state={{ filename }}>
          Perform test
        </Link>
      </Margin>
    </>
  );
}
