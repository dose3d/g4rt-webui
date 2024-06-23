import cn from 'classnames';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Breadcrumbs, { Breadcrumb, BreadcrumbsIconClass } from '../../components/Breadcrumbs';
import { ServerStackIcon } from '../../components/icons';
import {
  Card,
  CardHeader,
  CardHeaderMain,
  CardHeaderTitle,
  CardsContainer,
  Description,
  Margin,
  Page
} from '../../components/layout';
import { useAuthContext, useQueryWrapper } from '../../drf-crud-client';

export const WLTestPageBreadcrumbs: Breadcrumb[] = [
  { icon: <ServerStackIcon className={BreadcrumbsIconClass} />, label: 'WL Test', to: '/workspaces' },
];

interface Data {
  result: string[];
}

export default function WLTestResultsPage() {
  const authContext = useAuthContext();
  const ai = authContext.buildAxiosInstance();

  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const { state: { filename, bb_size } } = useLocation();
  const { data, isLoading } = useQueryWrapper<Data>({
    endpoint: `/api/wl-test`,
    config: { params: { filename, bb_size } },
    queryKey: [filename, bb_size],
    staleTime: 1000 * 60 * 5,
  });

  const handleClick = async () => {
    try {
      setIsPdfGenerating(true);
      const response = await ai.get('/api/wl-test/pdf', {
        params: { filename, bb_size },
        responseType: 'blob', // Specify response type to 'blob' for handling binary data like PDF
      });
      setIsPdfGenerating(false);
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
            {isLoading ? <Description> Loading... </Description> : <Description> Results: {data?.result}</Description>}
            <Margin>
              <Description>
                <button className={cn('btn-primary btn', { loading: isPdfGenerating })} disabled={isPdfGenerating} onClick={handleClick}>
                  Download full results in pdf
                </button>
              </Description>
            </Margin>
          </Card>
        </CardsContainer>
      </Margin>
    </Page>
  );
}
