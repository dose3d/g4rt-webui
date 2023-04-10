import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardHeaderMain,
  CardHeaderSubTitle,
  CardHeaderTitle,
  CardsContainer,
  Margin,
  Page,
} from '../../components/layout';
import { useJobEntity } from '../../api/jobs';
import { formatDate, formatFileSize } from '../../utils/formatValues';

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
                <CardHeaderTitle>Job details</CardHeaderTitle>
                <CardHeaderSubTitle>
                  Check job status and manage.
                </CardHeaderSubTitle>
              </CardHeaderMain>
            </CardHeader>

            <div>
              <dl>
                <dt>ID:</dt>
                <dd>{data?.id}</dd>

                <dt>Created date:</dt>
                <dd>{formatDate(data?.created_at)}</dd>

                <dt>Updated date:</dt>
                <dd>{formatDate(data?.updated_at)}</dd>

                <dt>Title:</dt>
                <dd>{data?.title}</dd>

                <dt>Description:</dt>
                <dd>{data?.description}</dd>

                <dt>Command line args:</dt>
                <dd>
                  <code>{data?.args}</code>
                </dd>

                <dt>TOML file content:</dt>
                <dd>
                  <pre>{data?.toml}</pre>
                </dd>
              </dl>
            </div>

            <h3>Execution status:</h3>
            <dl>
              <dt>Job status:</dt>
              <dd>{data?.status}</dd>

              <dt>Return code:</dt>
              <dd>{data?.ret_code}</dd>

              <dt>View logs file:</dt>
              <dd>
                <a href={data?.logs_href}>logs.txt</a>
              </dd>

              <dt>Download ROOT files:</dt>
              <dd>
                {data?.root_files ? (
                  <ol>
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
              </dd>
            </dl>
          </Card>
        </CardsContainer>
      </Margin>
    </Page>
  );
}
