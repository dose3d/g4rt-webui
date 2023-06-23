import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useJobRootFileDownload, useJobRootFileEntity } from '../../api/jobsRootFile';
import {
  Card,
  CardHeader,
  CardHeaderMain,
  CardHeaderTitle,
  CardsContainer,
  Margin,
  Page,
} from '../../components/layout';
import { formatDate } from '../../utils/formatValues';
import { buildGUI } from 'jsroot';
import { DocumentIcon } from '../../components/icons';
import Breadcrumbs, { Breadcrumb, BreadcrumbsIconClass } from '../../components/Breadcrumbs';
import { JobDetailPageBreadcrumbs } from '../jobs/JobDetailPage';

const JobRootDetailPageBreadcrumbs = (
  jobId: number | undefined,
  rootId: number | undefined,
  name: string | undefined,
) =>
  [
    ...JobDetailPageBreadcrumbs(jobId),
    {
      icon: <DocumentIcon className={BreadcrumbsIconClass} />,
      label: name,
      to: `/jobs/${jobId}/root/${rootId}`,
    },
  ] as Breadcrumb[];

export default function JobRootDetailPage() {
  const { fileId } = useParams();
  const fId = parseInt(`${fileId}`);
  const { data } = useJobRootFileEntity(fId);
  const { data: rootFile, isSuccess } = useJobRootFileDownload(fId);

  useEffect(() => {
    if (isSuccess) {
      buildGUI('jsroot').then((h: any) => {
        document.querySelector('.jsroot_browser_title')?.remove();
        document.querySelector('.jsroot_browser_version')?.remove();
        document.querySelector('.gui_urlToLoad')?.remove();
        document.querySelector('.gui_selectFileName')?.remove();
        document.querySelector('#gui_fileCORS')?.remove();
        document.querySelector('.gui_localFile')?.parentElement?.remove();
        document.querySelector('.gui_ReadFileBtn')?.parentElement?.remove();

        h.openRootFile(rootFile);
      });
    }
  }, [rootFile, isSuccess]);

  return (
    <Page>
      <Margin>
        <CardsContainer>
          <Card>
            <CardHeader>
              <CardHeaderMain>
                <Breadcrumbs breadcrumbs={JobRootDetailPageBreadcrumbs(data?.job.id, data?.id, data?.file_name)} />
                <CardHeaderTitle>{`#${data?.id}: ${data?.file_name}`}</CardHeaderTitle>
                <div className="text-xs font-bold text-gray-500">
                  Job: {`#${data?.job.id}: ${data?.job.title}`}, Date: {formatDate(data?.job.updated_at)}
                </div>
              </CardHeaderMain>
            </CardHeader>
            <div id="jsroot" style={{ width: '100%', height: '800px', position: 'relative' }}></div>
          </Card>
        </CardsContainer>
      </Margin>
    </Page>
  );
}
