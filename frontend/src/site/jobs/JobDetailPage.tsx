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
import { useJobDelete, useJobEntity, useJobKill } from '../../api/jobs';
import { formatDate, formatFileSize } from '../../utils/formatValues';
import { CloseIcon, DeleteIcon, EditIcon, PlayIcon } from '../../components/icons';
import ActionButton from '../../components/ActionButton';

function LabelValueHOutline({ children }: { children: React.ReactNode }) {
  return <section className="table">{children}</section>;
}

function LabelValueH({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <dl className="table-row">
      <dt className="table-cell">{label}</dt>
      <dd className="table-cell pl-8 font-bold">{children}</dd>
    </dl>
  );
}

function JobButtons({ jobId }: { jobId: number }) {
  const deleteAction = useJobDelete(jobId);
  const killAction = useJobKill(jobId);

  return (
    <div className="flex gap-4">
      <button className="btn-warning btn-sm btn">
        <EditIcon className="mr-2 h-5 w-5" /> Edit
      </button>
      <button className="btn-success btn-sm btn">
        <PlayIcon className="mr-2 h-5 w-5" /> Run
      </button>
      <ActionButton className="btn-error btn-sm btn" drf={killAction} icon={<CloseIcon className="h-5 w-5" />}>
        <span className="ml-2"> Kill</span>
      </ActionButton>
      <ActionButton className="btn-error btn-sm btn" drf={deleteAction}>
        <DeleteIcon className="mr-2 h-5 w-5" /> Delete
      </ActionButton>
    </div>
  );
}

export default function JobDetailPage() {
  const { jobId } = useParams();
  const { data } = useJobEntity(parseInt(`${jobId}`));

  return (
    <Page>
      <Margin>
        <CardsContainer>
          <Card>
            <CardHeader>
              <CardHeaderMain>
                <CardHeaderTitle>{`#${data?.id}: ${data?.title}`}</CardHeaderTitle>
                <div className="text-xs font-bold text-gray-500">
                  Created: {formatDate(data?.created_at)}, updated: {formatDate(data?.updated_at)}
                </div>
              </CardHeaderMain>
              <div className="inline-flex items-center p-2 text-sm font-medium">
                <LabelValueHOutline>
                  <LabelValueH label="Status:">{data?.status}</LabelValueH>
                </LabelValueHOutline>
              </div>
            </CardHeader>

            {jobId && <JobButtons jobId={parseInt(jobId)} />}

            <h3 className="mb-2 mt-4 font-bold">Details:</h3>
            <div className="ml-4">
              <LabelValueHOutline>
                <LabelValueH label="Status:">{data?.status}</LabelValueH>
                <LabelValueH label="Return code:">{data?.ret_code}</LabelValueH>
                <LabelValueH label="View logs file:">
                  <a href={data?.logs_href}>logs.txt</a>
                </LabelValueH>
              </LabelValueHOutline>
            </div>

            <h3 className="mb-2 mt-4 font-bold">Description:</h3>
            <div className="ml-4 whitespace-pre-line text-base font-normal text-gray-500">{data?.description}</div>

            <h3 className="mb-2 mt-4 font-bold">Results:</h3>
            <div className="ml-4">
              {data?.root_files ? (
                <ol className="list-inside list-decimal">
                  {data?.root_files.map((o, i) => (
                    <li key={i}>
                      <a href={o.href}>
                        {o.file_name} ({formatFileSize(o.size)})
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

            <div id="drawing" style={{ width: '800px', height: '600px' }}></div>
          </Card>
        </CardsContainer>
      </Margin>
    </Page>
  );
}
