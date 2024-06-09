import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import JSZip from 'jszip';
import React, { useEffect, useState } from 'react';
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
  ErrorAlert,
  Margin,
  Page,
} from '../../components/layout';
import { useFormatErrorToString, useQueryWrapper } from '../../drf-crud-client';
import { WLTestPageBreadcrumbs } from './WLTestPage';
import { PLOTS, Plots, TEXT_RESULTS, TextResults } from './api';

export const WLTestResultsPageBreadcrumbs: Breadcrumb[] = [
  ...WLTestPageBreadcrumbs,
  { icon: <ServerStackIcon className={BreadcrumbsIconClass} />, label: 'W-L Results', to: '/wl-test/results' },
];

export default function WLTestResultsPage() {
  const formatErrorToString = useFormatErrorToString();
  const [images, setImages] = useState<Plots>();
  const {
    state: { filename, bb_size },
  } = useLocation();

  const {
    data: textData,
    isLoading: isTextDataLoading,
    failureReason: textFailureReason,
  } = useQueryWrapper<TextResults>({
    endpoint: `/api/wl/text`,
    config: { params: { filename, bb_size } },
    queryKey: [filename, bb_size, 'wl_results_text'],
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: plotsData,
    isLoading: isPlotLoading,
    failureReason: plotFailureReason,
  } = useQueryWrapper<Blob>({
    endpoint: 'api/wl/plots',
    config: { params: { filename, bb_size }, responseType: 'blob' },
    queryKey: [filename, bb_size, 'wl_results_plots'],
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const extractMetadataFromZip = async (blob: Blob) => {
      const zip = await JSZip.loadAsync(blob);
      return Promise.all(
        PLOTS.map(async (plotData) => {
          const blob = await zip.file(plotData.filename)?.async('blob');
          let url = undefined;
          if (blob !== undefined) {
            url = URL.createObjectURL(blob);
          }
          return { filename: plotData.title, description: plotData.description, url };
        }),
      );
    };

    if (plotsData !== undefined) {
      extractMetadataFromZip(plotsData).then((images) => setImages(images));
    }
  }, [plotsData]);

  return (
    <Page>
      <Margin>
        <CardsContainer>
          <Card>
            <CardHeader>
              <CardHeaderMain>
                <Breadcrumbs breadcrumbs={WLTestResultsPageBreadcrumbs} />
                <CardHeaderTitle>W-L test results</CardHeaderTitle>
              </CardHeaderMain>
              <DownloadPDFButton isPlotLoading={isPlotLoading} bb_size={bb_size} filename={filename} />
            </CardHeader>
            <div className="flex flex-col space-y-4">
              <CollapseSection title="Data" tabindex={0}>
                <TextResultsSection textDataResults={textData} isTextDataLoading={isTextDataLoading} />
                {!!textFailureReason && (
                  <ErrorAlert className="my-4">{formatErrorToString(textFailureReason)}</ErrorAlert>
                )}
              </CollapseSection>
              <CollapseSection title="Plots" tabindex={1}>
                <PlotResultsSection images={images} isPlotLoading={isPlotLoading} />
                {!!plotFailureReason && (
                  <ErrorAlert className="my-4">{formatErrorToString(plotFailureReason)}</ErrorAlert>
                )}
              </CollapseSection>
            </div>
          </Card>
        </CardsContainer>
      </Margin>
    </Page>
  );
}

function CollapseSection({
  title,
  children,
  tabindex,
}: {
  title: string;
  children: React.ReactNode;
  tabindex: number;
}) {
  return (
    <div tabIndex={tabindex} className="collapse-arrow collapse overflow-visible border-2">
      <input type="checkbox" />
      <div className="collapse-title text-primary text-xl font-semibold">{title}</div>
      <div className="collapse-content ">{children}</div>
    </div>
  );
}

function TextResultsSection({
  textDataResults,
  isTextDataLoading,
}: {
  textDataResults: TextResults | undefined;
  isTextDataLoading: boolean;
}) {
  return (
    <>
      {isTextDataLoading ? (
        <div className="loading" />
      ) : (
        <div className="grid grid-cols-1 gap-8 gap-x-16 p-4 md:grid-cols-2 xl:grid-cols-3">
          {TEXT_RESULTS.map(({ title, description, key }) => (
            <div key={key}>
              <div className="flex flex-row">
                <p className={'text-secondary font-semibold'}>{title} </p>
                <div className="tooltip tooltip-bottom tooltip-secondary text-secondary pl-2" data-tip={description}>
                  <FontAwesomeIcon icon={faCircleInfo} />
                </div>
              </div>
              <p className={'pt-1 text-base font-normal text-black'}>
                {textDataResults ? textDataResults[key as keyof TextResults] : 'Error'}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function PlotResultsSection({ images, isPlotLoading }: { images: Plots | undefined; isPlotLoading: boolean }) {
  return (
    <>
      {isPlotLoading ? (
        <div className="loading" />
      ) : (
        <div className="p-4 pb-12">
          {images?.map(({ filename, description, url }, index) => {
            return (
              <div key={index}>
                <p className={'text-secondary text-base font-semibold'}>{filename}</p>
                <Description>{description}</Description>
                <div className="flex justify-center p-4">
                  <img key={index} src={url} alt={`Plot ${index + 1}`} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function DownloadPDFButton({
  isPlotLoading,
  filename,
  bb_size,
}: {
  isPlotLoading: boolean;
  filename: string;
  bb_size: string;
}) {
  const { isFetching: isPdfLoading, refetch } = useQueryWrapper<Blob>({
    endpoint: `/api/wl/pdf`,
    config: { params: { filename, bb_size }, responseType: 'blob' },
    queryKey: [filename, bb_size, 'wl_results_pdf'],
    enabled: false,
    staleTime: 1000 * 60 * 5,
  });

  const handleClick = async () => {
    const pdfData = (await refetch()).data;
    if (pdfData === undefined) {
      return;
    }
    const pdfUrl = window.URL.createObjectURL(new Blob([pdfData], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.setAttribute('download', 'filename.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <>
      {isPlotLoading ? (
        <div className="loading" />
      ) : (
        <div className="flex justify-center">
          <button disabled={isPdfLoading} onClick={handleClick} className="btn-primary btn btn-wide mt-4">
            <span className={cn({ 'text-gray-400': isPdfLoading })}>Download PDF report</span>
            {isPdfLoading && <div className="loading text-gray-400" />}
          </button>
        </div>
      )}
    </>
  );
}
