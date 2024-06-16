import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
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
  Title,
} from '../../components/layout';
import { AddIcon, ServerStackIcon } from '../../components/icons';
import Pagination from '../../components/Pagination';
import { useWorkspaceList } from '../../api/workspaces';
import Breadcrumbs, { Breadcrumb, BreadcrumbsIconClass } from '../../components/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import { useRootFileForm } from '../../api/rootFile';
import { UploadFileSuccessCallback, useFormatErrorToString } from '../../drf-crud-client';
import { CTextArea, CTextInput } from '../../components/forms';
import UploadFile from '../../components/UploadFile';
import { UseUploadRequest, useUploadRequest } from '../../drf-crud-client';
import { useDropzone } from 'react-dropzone';

export const WLTestPageBreadcrumbs: Breadcrumb[] = [
  { icon: <ServerStackIcon className={BreadcrumbsIconClass} />, label: 'WL Test', to: '/workspaces' },
];

export default function WLTestPage() {
  const [filesUploaded, setFilesUploaded] = useState(false);
  const navigate = useNavigate();

  const { onDrop, errorMessage } = useUploadRequest({ endpoint: "/api/upload/", onSuccess: () => setFilesUploaded(true) });

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({ onDrop, multiple: false, accept: { 'application/zip': ['.zip'], 'application/x-zip-compressed': ['.zip'] } });

  return (
    <Page>
      <Margin>
        <CardsContainer>
          <Card>
            <CardHeader>
              <CardHeaderMain>
                <Breadcrumbs breadcrumbs={WLTestPageBreadcrumbs} />
                <CardHeaderTitle>WL test Setup page</CardHeaderTitle>
                <CardHeaderSubTitle>
                  To perform WL test upload dcm files using field above.
                </CardHeaderSubTitle>
              </CardHeaderMain>
            </CardHeader>
            {!filesUploaded ?
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
                  <div className="btn btn-ghost">
                    Perform test
                  </div>
                </div>
              </>
              :
              <>
                <p>Uploaded Files:</p>
                <ul>
                  {acceptedFiles.map((file: any) => (
                    <li key={file.path}>
                      {file.path}
                    </li>
                  ))}
                </ul>
                <div className="flex w-full items-center">
                  <Link to="results" className="btn btn-primary" state={{ filename: (acceptedFiles[0] as any).path }}>
                    Perform test
                  </Link>
                </div>
              </>
            }


          </Card>
        </CardsContainer>
      </Margin>
    </Page>
  );
}
