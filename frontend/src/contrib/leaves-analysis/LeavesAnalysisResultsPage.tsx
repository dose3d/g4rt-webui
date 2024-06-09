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
import { LeavesAnalysisBreadcrumbs } from './LeavesAnalysisSetupPage';
import { Images, IMAGES } from './api';

export const LeavesAnalysisResultsPageBreadcrumbs: Breadcrumb[] = [
  ...LeavesAnalysisBreadcrumbs,
  {
    icon: <ServerStackIcon className={BreadcrumbsIconClass} />,
    label: 'Leaves Analysis Results',
    to: '/leaves-analysis/results',
  },
];

type LeavesAnalysisResultsPageProps = {
  id: number;
  side: string;
  errors: number;
  distances: number[];
  mean_distance_pixels: number;
  mean_distance_mm: number;
}[];

export default function LeavesAnalysisResultsPage() {
  const formatErrorToString = useFormatErrorToString();
  const [images, setImages] = useState<Images>({});
  const [showLeaves, setShowLeaves] = useState(true);
  const [erroredLeaves, setErroredLeaves] = useState<LeavesAnalysisResultsPageProps>([]);

  const {
    state: {
      x_mm,
      y_mm,
      tolerance_x,
      tolerance_y,
      permitted_errors_per_leaf,
      filename,
      threshold,
      SE_size,
      sobel_kernel_size,
      leaves_filename,
    },
  } = useLocation();

  const {
    data: resultImagesZip,
    isLoading: isZipLoading,
    failureReason: zipFailureReason,
  } = useQueryWrapper<Blob>({
    endpoint: '/api/la/analyze',
    config: {
      params: {
        filename: filename[0],
        x_mm,
        y_mm,
        tolerance_x,
        tolerance_y,
        permitted_errors_per_leaf,
        threshold,
        SE_size,
        sobel_kernel_size,
        leaves_filename: leaves_filename[0],
      },
      responseType: 'blob',
    },
    queryKey: [x_mm, y_mm, tolerance_x, tolerance_y, permitted_errors_per_leaf, filename, 'leaves-analysis'],
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const extractMetadataFromZip = async (blob: Blob) => {
      const zip = await JSZip.loadAsync(blob);
      const imagePromises = IMAGES.map(async (imageData) => {
        const blob = await zip.file(imageData.filename)?.async('blob');
        let url = undefined;
        if (blob !== undefined) {
          url = URL.createObjectURL(blob);
        } else {
          url = '';
        }
        return { title: imageData.title, url };
      });

      const textFile = await zip.file('text.json')?.async('text');
      const textData = textFile !== undefined ? JSON.parse(textFile) : {};

      const imagesArray = await Promise.all(imagePromises);

      return { images: imagesArray, textData };
    };

    if (resultImagesZip !== undefined) {
      extractMetadataFromZip(resultImagesZip).then((content) => {
        setImages(
          content.images.reduce(
            (acc, image) => {
              acc[image.title] = image.url;
              return acc;
            },
            {} as Record<string, string>,
          ),
        );
        console.log(content.textData);
        setErroredLeaves(content.textData);
      });
    }
  }, [resultImagesZip]);

  return (
    <Page>
      <Margin>
        <CardsContainer>
          <Card>
            <CardHeader>
              <CardHeaderMain>
                <Breadcrumbs breadcrumbs={LeavesAnalysisResultsPageBreadcrumbs} />
                <CardHeaderTitle>Leaves analysis results</CardHeaderTitle>
              </CardHeaderMain>
            </CardHeader>
            <>
              {isZipLoading ? (
                <div className="loading" />
              ) : (
                <div className="">
                  <div className="flex items-center pl-12">
                    <input
                      type="checkbox"
                      checked={showLeaves}
                      onChange={(e) => setShowLeaves(e.target.checked)}
                      className="toggle toggle-primary [--tglbg:white]"
                    />
                    <p className="text-neutral pl-2 text-lg">Show leaves</p>
                  </div>

                  <div className="flex flex-col xl:flex-row">
                    <PrintImages
                      img1={images['initial_with_leaves']}
                      img2={images['initial']}
                      showLeaves={showLeaves}
                      desc={'Initial image'}
                    />
                    <PrintImages
                      img1={images['combined_with_leaves']}
                      img2={images['combined']}
                      showLeaves={showLeaves}
                      desc={'Preprocessed image'}
                    />
                  </div>

                  <div className="flex flex-col xl:flex-row">
                    <PrintImages
                      img1={images['colored_leaves_left']}
                      img2={images['colored_left']}
                      showLeaves={showLeaves}
                      desc={'Left side'}
                    />
                    <PrintImages
                      img1={images['colored_leaves_right']}
                      img2={images['colored_right']}
                      showLeaves={showLeaves}
                      desc={'Right side'}
                    />
                  </div>
                  <div className="flex justify-between">
                    <div className="px-12">
                      <p className="text-secondary font-semibold">Errored leaves:</p>
                      {erroredLeaves.map((leaf) => (
                        <div key={leaf.id} className="flex flex-col">
                          <div className="flex items-center">
                            <span className="bg-secondary mr-2 inline-block h-2 w-2 rounded-full"></span>
                            <Text>
                              Leaf {leaf.id} ({leaf.side})
                            </Text>
                          </div>
                          <div className="pl-8">
                            <Text>
                              Mean distance: {leaf.mean_distance_mm} mm ({leaf.mean_distance_pixels} px)
                            </Text>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-12">
                      <p className="text-secondary font-semibold">Legend:</p>
                      <div className="flex items-center">
                        <span className="mr-2 inline-block h-2 w-2 rounded bg-green-400"></span>
                        <Text>Leaf in tolerance</Text>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2 inline-block h-2 w-2 rounded bg-red-500"></span>
                        <Text>Leaf not in tolerance x and not in tolerance y</Text>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2 inline-block h-2 w-2 rounded bg-yellow-400"></span>
                        <Text>Leaf not in tolerance x, but in tolerance y</Text>
                      </div>
                      <p>
                        For the y-coordinate where no edge is detected, a yellow or red stripe is marked across the
                        width of the image
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          </Card>
        </CardsContainer>
      </Margin>
    </Page>
  );
}

function Text({ children }: { children: any }) {
  return <p className="text-base-100">{children}</p>;
}

function PrintImage({ url }: { url: string }) {
  return <img src={url} alt={`plot ${url}`} className="bg-grey rounded-xl border p-2 shadow-lg" />;
}

function PrintImages({ img1, img2, showLeaves, desc }: any) {
  return (
    <div className="p-8">
      <p className="text-primary pb-2 pl-4 font-semibold">{desc}</p>
      {showLeaves ? <PrintImage url={img1} /> : <PrintImage url={img2} />}
    </div>
  );
}
