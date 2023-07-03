import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardHeaderMain,
  CardHeaderTitle,
  CardsContainer,
  Margin,
  Page,
} from '../../components/layout';
import { useWorkspaceEntity } from '../../api/workspaces';
import { formatDate,  } from '../../utils/formatValues';
import { DocumentIcon } from '../../components/icons';
import Breadcrumbs, { Breadcrumb, BreadcrumbsIconClass } from '../../components/Breadcrumbs';
import { WorkspacesPageBreadcrumbs } from './WorkspacesPage';
import { WorkspaceCells } from '../../components/WorkspaceCells';

export const WorkspaceDetailPageBreadcrumbs = (id: number | undefined) =>
  [
    ...WorkspacesPageBreadcrumbs,
    {
      icon: <DocumentIcon className={BreadcrumbsIconClass} />,
      label: `Workspace #${id}`,
      to: `/workspaces/${id}`,
    },
  ] as Breadcrumb[];

export default function WorkspaceDetailPage() {
  const { workspaceId } = useParams();

  const { data } = useWorkspaceEntity(parseInt(`${workspaceId}`));

  return (
    <Page>
      <Margin>
        <CardsContainer>
          <Card>
            <CardHeader>
              <CardHeaderMain>
                <Breadcrumbs breadcrumbs={WorkspaceDetailPageBreadcrumbs(data?.id)} />
                <CardHeaderTitle>{`#${data?.id}: ${data?.title}`}</CardHeaderTitle>
                <div className="text-xs font-bold text-gray-500">
                  Created: {formatDate(data?.created_at)}, updated: {formatDate(data?.updated_at)}
                </div>
              </CardHeaderMain>
            </CardHeader>

            <h3 className="mb-2 mt-4 font-bold">Description:</h3>
            <div className="ml-4 whitespace-pre-line text-base font-normal text-gray-500">{data?.description}</div>

            {data && <WorkspaceCells workspace={data} />}
          </Card>
        </CardsContainer>
      </Margin>
    </Page>
  );
}
