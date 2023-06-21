import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorAlert, Page, PageHeader, Title } from '../../components/layout';
import { AddIcon, RocketLaunchIcon } from '../../components/icons';
import JobsTable from '../../components/JobsTable';
import Pagination from '../../components/Pagination';
import { useJobList } from '../../api/jobs';
import { useFormatErrorToString } from '../../drf-crud-client';
import Breadcrumbs, { Breadcrumb, BreadcrumbsIconClass } from '../../components/Breadcrumbs';

export const JobsPageBreadcrumbs: Breadcrumb[] = [
  { icon: <RocketLaunchIcon className={BreadcrumbsIconClass} />, label: 'Jobs', to: '/jobs' },
];

export default function JobsPage() {
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, controller, lastError, isFetching } = useJobList(pageSize);
  const formatErrorToString = useFormatErrorToString();

  return (
    <Page>
      <PageHeader>
        <Breadcrumbs breadcrumbs={JobsPageBreadcrumbs} />
        <Title>List of jobs</Title>
        {!!lastError && <ErrorAlert className="my-4">{formatErrorToString(lastError)}</ErrorAlert>}

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
                  placeholder="Search for jobs"
                  disabled
                />
              </div>
            </form>
            <div className="flex w-full items-center sm:justify-end">
              <Link to="/jobs/create" className="btn-primary btn">
                <AddIcon />
                New job
              </Link>
            </div>
          </div>
        )}
      </PageHeader>
      {!!data && (
        <>
          <JobsTable isLoading={isLoading} jobs={data?.results} />
          <Pagination controller={controller} pageSize={pageSize} setPageSize={setPageSize} />
        </>
      )}
    </Page>
  );
}
