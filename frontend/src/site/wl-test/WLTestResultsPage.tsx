import React, { Suspense, useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import cn from 'classnames';
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
  Page,
  Title,
} from '../../components/layout';
import { AddIcon, ServerStackIcon } from '../../components/icons';
import Pagination from '../../components/Pagination';
import { useWorkspaceList } from '../../api/workspaces';
import Breadcrumbs, { Breadcrumb, BreadcrumbsIconClass } from '../../components/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import { useRootFileForm } from '../../api/rootFile';
import { UploadFileSuccessCallback, useAuthContext, useFormatErrorToString, useQueryWrapper } from '../../drf-crud-client';
import { CTextArea, CTextInput } from '../../components/forms';
import UploadFile from '../../components/UploadFile';

export const WLTestPageBreadcrumbs: Breadcrumb[] = [
  { icon: <ServerStackIcon className={BreadcrumbsIconClass} />, label: 'WL Test', to: '/workspaces' },
];

interface Data {
  result: string;
}

export default function WLTestResultsPage() {
  const authContext = useAuthContext();
  const ai = authContext.buildAxiosInstance();

  const { state } = useLocation();
  const filename = state.filename;
  const { data, isLoading } = useQueryWrapper<Data>({
    endpoint: `/api/wl-test`, config: { params: { filename } }, queryKey: [filename],
    // staleTime: 1000 * 60 * 5,
    staleTime: 0,
  });

  const handleClick = async () => {
    try {
      const response = await ai.get('/api/wl-test/pdf', {
        params: { filename },
        responseType: 'blob' // Specify response type to 'blob' for handling binary data like PDF
      });
      const pdfUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.setAttribute('download', 'filename.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Page>
      <Margin>
        <CardsContainer>
          <Card>
            <CardHeader>
              <CardHeaderMain>
                <Breadcrumbs breadcrumbs={WLTestPageBreadcrumbs} />
                <CardHeaderTitle>WL test completed successfully</CardHeaderTitle>
              </CardHeaderMain>
            </CardHeader>
            {
              isLoading
                ? <Description> Loading... </Description>
                : <Description> Results: {data?.result}</Description>
            }
            <Description>
              <button className="btn btn-primary" onClick={handleClick}>Download full results in pdf</button>
            </Description>
          </Card>
        </CardsContainer>
      </Margin>
    </Page>
  );
}

