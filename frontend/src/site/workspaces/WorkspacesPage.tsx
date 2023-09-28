import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardHeaderMain,
  CardsContainer,
  ErrorAlert,
  Margin,
  Page,
  Title,
} from '../../components/layout';
import { AddIcon, ServerStackIcon } from '../../components/icons';
import Pagination from '../../components/Pagination';
import { useWorkspaceList } from '../../api/workspaces';
import { useFormatErrorToString } from '../../drf-crud-client';
import Breadcrumbs, { Breadcrumb, BreadcrumbsIconClass } from '../../components/Breadcrumbs';
import WorkspacesTable from './cells/WorkspacesTable';

export const WorkspacesPageBreadcrumbs: Breadcrumb[] = [
  { icon: <ServerStackIcon className={BreadcrumbsIconClass} />, label: 'Workspaces', to: '/workspaces' },
];

export default function WorkspacesPage() {
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, controller, failureReason, isFetching } = useWorkspaceList(pageSize);
  const formatErrorToString = useFormatErrorToString();

  return (
    <Page>
      <Margin>
        <CardsContainer>
          <Card>
            <CardHeader>
              <CardHeaderMain>
                <Breadcrumbs breadcrumbs={WorkspacesPageBreadcrumbs} />
                <Title>List of workspaces</Title>
              </CardHeaderMain>
              {!!failureReason && <ErrorAlert className="my-4">{formatErrorToString(failureReason)}</ErrorAlert>}

              <div className="h-6">{isFetching && <progress className="progress" />}</div>

              {!!data && (
                <div className="block items-center sm:flex md:divide-x md:divide-gray-100">
                  <form className="mb-4 sm:mb-0 sm:pr-3" action="#" method="GET">
                    <label htmlFor="products-search" className="sr-only">
                      Search
                    </label>
                    <div className="relative mt-1 sm:w-64 xl:w-96">
                      <input
                        type="text"
                        name="email"
                        id="products-search"
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-cyan-600 focus:ring-cyan-600 sm:text-sm"
                        placeholder="Search for workspaces"
                        disabled
                      />
                    </div>
                  </form>
                  <div className="flex w-full items-center sm:justify-end">
                    <Link to="/workspaces/create" className="btn btn-primary">
                      <AddIcon />
                      New workspace
                    </Link>
                  </div>
                </div>
              )}
            </CardHeader>
            {!!data && (
              <>
                <WorkspacesTable isLoading={isLoading} workspaces={data?.results} pageSize={pageSize} />
                <Pagination controller={controller} pageSize={pageSize} setPageSize={setPageSize} />
              </>
            )}
          </Card>
        </CardsContainer>
      </Margin>
    </Page>
  );
}
