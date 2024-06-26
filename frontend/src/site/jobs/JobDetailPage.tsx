import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardHeaderMain,
  CardHeaderTitle,
  CardsContainer,
  Margin,
  Page,
} from '../../components/layout';
import {
  JOB_STATUS_NAME,
  JobEntity,
  useJobDelete,
  useJobEntity,
  useJobKill,
  useJobOutputLogs,
  useJobRemoveFromQueue,
  useJobRun,
} from '../../api/jobs';
import { formatDate, formatFileSize } from '../../utils/formatValues';
import { CloseIcon, DeleteIcon, DocumentIcon, EditIcon, PauseIcon, PlayIcon } from '../../components/icons';
import ActionButton from '../../components/ActionButton';
import { useJobRootFileRender } from '../../api/jobsRootFile';
import { useQueryClient } from '@tanstack/react-query';
import Breadcrumbs, { Breadcrumb, BreadcrumbsIconClass } from '../../components/Breadcrumbs';
import { JobsPageBreadcrumbs } from './JobsPage';
import { getEntityQueryKey } from '../../drf-crud-client';
import moment from "moment";

function LabelValueHOutline({ children }: { children: React.ReactNode }) {
  return <section className="table w-auto">{children}</section>;
}

function LabelValueH({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <dl className="table-row">
      <dt className="table-cell">{label}</dt>
      <dd className="table-cell pl-8 font-bold">{children}</dd>
    </dl>
  );
}

function LogsAutoRefresh({ id, interval }: { id: number; interval: number }) {
  const { data } = useJobOutputLogs(id, interval);
  return <>{data}</>;
}

function JobButtons({ job }: { job: JobEntity }) {
  const { id: jobId, status, title, description, toml, args } = job;

  const killAction = useJobKill(jobId);
  const deleteAction = useJobDelete(jobId);
  const runAction = useJobRun(jobId);
  const rfkAction = useJobRemoveFromQueue(jobId);
  const navigate = useNavigate();

  const editAsNewJob = () => {
    const reg = / - run again: \d\d\d\d-\d\d-\d\d \d\d:\d\d/;
    const newTitle = `${title.replace(reg, '')} - run again: ${moment().format('yyyy-MM-DD HH:mm')}`;
    navigate('/jobs/create', { state: { title: newTitle, description, toml, args } });
  };

  return (
    <div className="flex gap-4">
      <ActionButton
        className="btn btn-success btn-sm"
        drf={runAction}
        disabled={status != 'init'}
        icon={<PlayIcon className="h-5 w-5" />}
        title="Run immediatelly or add to queue"
      >
        <span className="ml-2"> Run</span>
      </ActionButton>
      <ActionButton
        className="btn btn-warning btn-sm"
        drf={rfkAction}
        disabled={status != 'queue'}
        icon={<PauseIcon className="h-5 w-5" />}
        title="Remove from queue"
      >
        <span className="ml-2"> Dequeue</span>
      </ActionButton>
      <button
        className="btn btn-warning btn-sm"
        title="Create new job using settings from this job."
        onClick={editAsNewJob}
      >
        <EditIcon className="mr-2 h-5 w-5" /> Edit as new job
      </button>
      <ActionButton
        className="btn btn-error btn-sm"
        drf={killAction}
        disabled={status != 'running'}
        icon={<CloseIcon className="h-5 w-5" />}
        title="Kill the ROOT process"
        confirm="Are you sure to kill ROOT process?"
      >
        <span className="ml-2"> Kill</span>
      </ActionButton>
      <ActionButton
        className="btn btn-error btn-sm"
        drf={deleteAction}
        disabled={status == 'running'}
        title="Remove job from queue or dones, if running you must kill before delete"
        confirm="Are you sure to remove this job and all files from this job?"
        mutateOptions={{
          onSuccess: () => {
            navigate('/jobs/');
          },
        }}
      >
        <DeleteIcon className="mr-2 h-5 w-5" /> Delete
      </ActionButton>
    </div>
  );
}

function RenderButton({ fileId, jobId }: { fileId: number; jobId: number }) {
  const render = useJobRootFileRender(fileId);
  const queryClient = useQueryClient();

  return (
    <ActionButton
      className="btn btn-secondary btn-xs"
      drf={render}
      title="Generate .root file with visualization"
      mutateOptions={{
        onSuccess: () => {
          queryClient.invalidateQueries(getEntityQueryKey('jobs', jobId)).then();
        },
      }}
    >
      Render
    </ActionButton>
  );
}

export const JobDetailPageBreadcrumbs = (id: number | undefined) =>
  [
    ...JobsPageBreadcrumbs,
    {
      icon: <DocumentIcon className={BreadcrumbsIconClass} />,
      label: `Job #${id}`,
      to: `/jobs/${id}`,
    },
  ] as Breadcrumb[];

export default function JobDetailPage() {
  const { jobId } = useParams();
  const [refetchInterval, setRefetchInterval] = useState(10000);

  const { data } = useJobEntity(parseInt(`${jobId}`), refetchInterval);

  useEffect(() => {
    if (data?.status === 'queue') {
      setRefetchInterval(1000);
    } else {
      setRefetchInterval(10000);
    }
  }, [data]);

  return (
    <Page>
      <Margin>
        <CardsContainer>
          <Card>
            <CardHeader>
              <CardHeaderMain>
                <Breadcrumbs breadcrumbs={JobDetailPageBreadcrumbs(data?.id)} />
                <CardHeaderTitle>{`#${data?.id}: ${data?.title}`}</CardHeaderTitle>
                <div className="text-xs font-bold text-gray-500">
                  Created: {formatDate(data?.created_at)}, updated: {formatDate(data?.updated_at)}
                </div>
              </CardHeaderMain>
              <div className="inline-flex items-center p-2 text-sm font-medium">
                <LabelValueHOutline>
                  <LabelValueH label="Status:">{data ? JOB_STATUS_NAME[data?.status] : ''}</LabelValueH>
                </LabelValueHOutline>
              </div>
            </CardHeader>

            {data && <JobButtons job={data} />}

            <h3 className="mb-2 mt-4 font-bold">Details:</h3>
            <div className="ml-4">
              <LabelValueHOutline>
                <LabelValueH label="Status:">{data?.status}</LabelValueH>
                <LabelValueH label="Return code:">{data?.ret_code}</LabelValueH>
                <LabelValueH label="Created:">{formatDate(data?.created_at)}</LabelValueH>
                <LabelValueH label="Updated:">{formatDate(data?.updated_at)}</LabelValueH>
              </LabelValueHOutline>
            </div>

            <h3 className="mb-2 mt-4 font-bold">Description:</h3>
            <div className="ml-4 whitespace-pre-line text-base font-normal text-gray-500">{data?.description}</div>

            <h3 className="mb-2 mt-4 font-bold">Output:</h3>
            <div className="ml-4">
              {data?.root_files ? (
                <ol className="list-inside list-decimal">
                  {data?.root_files.map((o, i) => (
                    <li key={i} className="mb-2">
                      {o.display} ({formatFileSize(o.size)})
                      <Link to={`/jobs/${data.id}/root/${o.id}`} className="btn btn-info btn-xs ml-2">
                        open
                      </Link>
                      <a href={o.href} className="btn btn-warning btn-xs mx-2">
                        download
                      </a>
                      <RenderButton jobId={data?.id} fileId={o.id} />
                    </li>
                  ))}
                </ol>
              ) : (
                <>no files</>
              )}
            </div>

            <h3 className="mb-2 mt-4 font-bold">Log files:</h3>
            <div className="ml-4">
              {data?.logs_files ? (
                <ol className="list-inside list-decimal">
                  {data?.logs_files.map((o, i) => (
                    <li key={i}>
                      {o.display} ({formatFileSize(o.size)})
                      <a
                        href={`${o.href}?plain=text`}
                        className="btn btn-info btn-xs ml-2"
                        target="_blank"
                        rel="noreferrer"
                      >
                        open
                      </a>
                      <a href={o.href} className="btn btn-warning btn-xs mx-2">
                        download
                      </a>
                    </li>
                  ))}
                </ol>
              ) : (
                <>no files</>
              )}
            </div>

            <h3 className="mb-2 mt-4 font-bold">Run conditions:</h3>

            <div className="ml-4">
              <LabelValueHOutline>
                <LabelValueH label="Command line args:">
                  <code>{data?.args}</code>
                </LabelValueH>
              </LabelValueHOutline>
              <h4 className="mt-4">TOML file content:</h4>
              <pre className="border-2 border-gray-200 bg-gray-100 p-2">{data?.toml}</pre>
            </div>

            <h3 className="mb-2 mt-4 font-bold">Run output:</h3>
            <div className="ml-4">
              <pre className="border-2 border-gray-200 bg-gray-100 p-2">
                {data &&
                  (data.status == 'running' ? (
                    <LogsAutoRefresh id={data.id} interval={1000} />
                  ) : (
                    data.status == 'done' && <LogsAutoRefresh id={data.id} interval={0} />
                  ))}
              </pre>
            </div>
          </Card>
        </CardsContainer>
      </Margin>
    </Page>
  );
}
