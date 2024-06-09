import cn from 'classnames';
import React, { useEffect, useState } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';
import { SubmitHandler, UseFormRegister, UseFormSetValue, UseFormWatch, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumbs, { Breadcrumb, BreadcrumbsIconClass } from '../../components/Breadcrumbs';
import { CTextInput } from '../../components/forms';
import { DocumentIcon, ServerStackIcon } from '../../components/icons';
import {
  Card,
  CardHeader,
  CardHeaderMain,
  CardHeaderSubTitle,
  CardHeaderTitle,
  CardsContainer,
  Description,
  ErrorAlert,
  Margin,
  Page,
} from '../../components/layout';
import { useQueryWrapper, useUploadRequest } from '../../drf-crud-client';
import { useRootFileListForSelect } from '../../api/rootFile';
import { CReactSelectMultiInput } from '../../components/reactSelect';
import JSZip from 'jszip';
import { Images, IMAGES_PREPROCESS } from './api';

export const LeavesAnalysisBreadcrumbs: Breadcrumb[] = [
  { icon: <ServerStackIcon className={BreadcrumbsIconClass} />, label: 'Leaves Analysis', to: '/leaves-analysis' },
];

interface FormInput {
  x_mm: number;
  y_mm: number;
  tolerance_x: number;
  tolerance_y: number;
  permitted_errors_per_leaf: number;
  filename: string;

  // preprocessing args
  threshold: number;
  SE_size: number;
  sobel_kernel_size: number;
  leaves_filename: string;
}

export default function LeavesAnalysisSetupPage() {
  const [images, setImages] = useState<Images>({});
  const navigate = useNavigate();
  const {
    handleSubmit,
    control,
    setValue,
    watch,
    register,
    getValues,
    formState: { isValid },
  } = useForm<FormInput>();
  const onSubmit: SubmitHandler<FormInput> = (data) => navigate('/leaves-analysis/results', { state: data });

  const { data: rootFiles } = useRootFileListForSelect();

  const {
    data: resultImagesZip,
    isLoading: isZipLoading,
    failureReason: zipFailureReason,
    refetch,
  } = useQueryWrapper<Blob>({
    endpoint: '/api/la/preprocess',
    config: {
      params: {
        filename: getValues().filename?.at(0),
        threshold: getValues().threshold,
        SE_size: getValues().SE_size,
        sobel_kernel_size: getValues().sobel_kernel_size,
      },
      responseType: 'blob',
    },
    queryKey: [getValues(), 'leaves-analysis', 'preprocess'],
    enabled: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const extractMetadataFromZip = async (blob: Blob) => {
      const zip = await JSZip.loadAsync(blob);
      const imagePromises = IMAGES_PREPROCESS.map(async (imageData) => {
        const blob = await zip.file(imageData.filename)?.async('blob');
        let url = undefined;
        if (blob !== undefined) {
          url = URL.createObjectURL(blob);
        } else {
          url = '';
        }
        return { title: imageData.title, url };
      });

      const imagesArray = await Promise.all(imagePromises);

      return imagesArray;
    };

    if (resultImagesZip !== undefined) {
      extractMetadataFromZip(resultImagesZip).then((images) => {
        setImages(
          images.reduce(
            (acc, image) => {
              acc[image.title] = image.url;
              return acc;
            },
            {} as Record<string, string>,
          ),
        );
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
                <Breadcrumbs breadcrumbs={LeavesAnalysisBreadcrumbs} />
                <CardHeaderTitle>Leaves analysis setup</CardHeaderTitle>
                <CardHeaderSubTitle>
                  To perform analysis upload .dcm file below and specify parameters. File should be should be oriented
                  in a way that leaves are aligned horizontally.
                </CardHeaderSubTitle>
              </CardHeaderMain>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 gap-4 gap-x-8 md:grid-cols-2 xl:grid-cols-4">
                <CTextInput
                  name="x_mm"
                  control={control}
                  rules={{ required: true, pattern: { value: /^\d+$/, message: 'Only numbers are allowed' } }}
                  placeHolder="Insert the value..."
                  title="Horizontal real size of image (x) [mm]*"
                />

                <CTextInput
                  name="y_mm"
                  control={control}
                  rules={{ required: true, pattern: { value: /^\d+$/, message: 'Only numbers are allowed' } }}
                  placeHolder="Insert the value..."
                  title="Vertical real size of image (y) [mm]*"
                />

                <CTextInput
                  name="tolerance_x"
                  control={control}
                  rules={{ required: true, pattern: { value: /^\d+$/, message: 'Only numbers are allowed' } }}
                  placeHolder="Insert the value..."
                  title="Tolerance X [N pixels]*"
                />

                <CTextInput
                  name="tolerance_y"
                  control={control}
                  rules={{ required: true, pattern: { value: /^\d+$/, message: 'Only numbers are allowed' } }}
                  placeHolder="Insert the value..."
                  title="Tolerance Y [N pixels]*"
                />

                <CTextInput
                  name="permitted_errors_per_leaf"
                  control={control}
                  rules={{ required: true, pattern: { value: /^\d+$/, message: 'Only numbers are allowed' } }}
                  placeHolder="Insert the value..."
                  title="Permitted errors per leaf*"
                />

                <CTextInput
                  name="threshold"
                  control={control}
                  rules={{ required: true, pattern: { value: /^\d+$/, message: 'Only numbers are allowed' } }}
                  placeHolder="Insert the value..."
                  title="Threshold*"
                />
                <CTextInput
                  name="SE_size"
                  control={control}
                  rules={{ required: true, pattern: { value: /^\d+$/, message: 'Only numbers are allowed' } }}
                  placeHolder="Insert the value..."
                  title="SE size*"
                />
                <CTextInput
                  name="sobel_kernel_size"
                  control={control}
                  rules={{ required: true, pattern: { value: /^\d+$/, message: 'Only numbers are allowed' } }}
                  placeHolder="Insert the value..."
                  title="Sobel kernel size*"
                />
              </div>

              {/* TODO make file selection required for submitting */}
              <div>
                {rootFiles && (
                  <CReactSelectMultiInput
                    control={control}
                    name="filename"
                    title="Image to analyze (from uploaded files):"
                    options={rootFiles.map((o) => ({ label: `#${o.id}: ${o.title}`, value: o.title }))}
                  />
                )}
              </div>

              <div>
                {rootFiles && (
                  <CReactSelectMultiInput
                    control={control}
                    name="leaves_filename"
                    title="Filename of JSON file with leaves definition:*"
                    options={rootFiles.map((o) => ({ label: `#${o.id}: ${o.title}`, value: o.title }))}
                  />
                )}
              </div>

              <div className="flex justify-between">
                <Link to="/" className="btn-primary btn">
                  Abort
                </Link>
                <button type="button" onClick={() => refetch()} className="btn-secondary btn" disabled={!isValid}>
                  <span className={cn({ 'text-gray-400': !isValid })}>Show preview</span>
                </button>
                <button type="submit" className="btn-primary btn " disabled={!isValid}>
                  <span className={cn({ 'text-gray-400': !isValid })}>Analyze</span>
                </button>
              </div>
            </form>

            {resultImagesZip ? (
              <div className="flex flex-col p-4 xl:flex-row">
                <div className="p-1">
                  <p className="text-primary pb-2 pl-4 font-semibold">Original image</p>
                  <PrintImage url={images['initial']} />
                </div>
                <div>
                  <div className="p-1">
                    <p className="text-primary pb-2 pl-4 font-semibold">Preprocessed image</p>
                    <PrintImage url={images['preprocessed']} />
                  </div>
                </div>
              </div>
            ) : (
              <div />
            )}
          </Card>
        </CardsContainer>
      </Margin>
    </Page>
  );
}

function PrintImage({ url }: { url: string }) {
  return <img src={url} alt={`plot ${url}`} className="bg-grey rounded-xl border p-2 shadow-lg" />;
}
