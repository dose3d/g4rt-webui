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
import { UploadFileSuccessCallback, useFormatErrorToString, useQueryWrapper } from '../../drf-crud-client';
import { CTextArea, CTextInput } from '../../components/forms';
import UploadFile from '../../components/UploadFile';

export const WLTestPageBreadcrumbs: Breadcrumb[] = [
  { icon: <ServerStackIcon className={BreadcrumbsIconClass} />, label: 'WL Test', to: '/workspaces' },
];

export default function WLTestResultsPage() {
  const { data } = useQueryWrapper({ endpoint: "/api/wl-test" });
  const dataString = JSON.stringify(data);

  return (
    <Page>
      <Margin>
        <CardsContainer>
          <Card>
            <CardHeader>
              <CardHeaderMain>
                <Breadcrumbs breadcrumbs={WLTestPageBreadcrumbs} />
                <CardHeaderTitle>WL test completed successfully</CardHeaderTitle>
                <CardHeaderSubTitle>
                  Click <Link to="/workspaces" style={{ color: 'blue' }}>here</Link> to download results.
                </CardHeaderSubTitle>
              </CardHeaderMain>
            </CardHeader>
            <p>
              {dataString}
            </p>
          </Card>
        </CardsContainer>
      </Margin>
    </Page>
  );
}
