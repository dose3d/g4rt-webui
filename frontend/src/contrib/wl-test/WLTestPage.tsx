import cn from 'classnames';
import React, { useState } from 'react';
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
import { useUploadRequest } from '../../drf-crud-client';

export const WLTestPageBreadcrumbs: Breadcrumb[] = [
  { icon: <ServerStackIcon className={BreadcrumbsIconClass} />, label: 'WL Test', to: '/wl-test' },
];

interface FormInput {
  bb_size: number;
  uploaded_file: string;
}

export default function WLTestPage() {
  const [hashedFileName, setHashedFileName] = useState('');
  const navigate = useNavigate();
  const {
    handleSubmit,
    control,
    setValue,
    watch,
    register,
    formState: { isValid },
  } = useForm<FormInput>();
  const onSubmit: SubmitHandler<FormInput> = (data) =>
    navigate('/wl-test/results', { state: { filename: hashedFileName, bb_size: data.bb_size } });

  return (
    <Page>
      <Margin>
        <CardsContainer>
          <Card>
            <CardHeader>
              <CardHeaderMain>
                <Breadcrumbs breadcrumbs={WLTestPageBreadcrumbs} />
                <CardHeaderTitle>WL Test setup</CardHeaderTitle>
                <CardHeaderSubTitle>
                  To perform WL upload .dcm files below and specify BB size. Files should be packed in zip directory.
                </CardHeaderSubTitle>
              </CardHeaderMain>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CTextInput
                name="bb_size"
                control={control}
                rules={{ required: true, pattern: { value: /^\d+$/, message: 'Only numbers are allowed' } }}
                placeHolder="Insert the value..."
                title="BB size [mm]*"
              />
              <DropzoneView
                setValue={setValue}
                register={register}
                watch={watch}
                setHashedFileName={setHashedFileName}
              />
              <div className="flex justify-between">
                <Link to="/" className="btn-primary btn">
                  Abort
                </Link>
                <button type="submit" className="btn-primary btn " disabled={!isValid}>
                  <span className={cn({ 'text-gray-400': !isValid })}>Analyze</span>
                </button>
              </div>
            </form>
          </Card>
        </CardsContainer>
      </Margin>
    </Page>
  );
}

interface DropzoneViewProps {
  watch: UseFormWatch<FormInput>;
  register: UseFormRegister<FormInput>;
  setValue: UseFormSetValue<FormInput>;
  setHashedFileName: React.Dispatch<React.SetStateAction<string>>;
}
function DropzoneView({ watch, register, setValue, setHashedFileName }: DropzoneViewProps) {
  const { onDrop, errorMessage } = useUploadRequest({
    endpoint: '/api/wl/upload/',
    onSuccess: () => {
      setValue('uploaded_file', 'true', { shouldValidate: true });
    },
  });

  async function computeChecksum(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop: async (acceptedFiles: File[]) => {
      acceptedFiles = await Promise.all(
        acceptedFiles.map(async (file) => new File([file], await computeChecksum(file))),
      );
      setHashedFileName(acceptedFiles[0].name);
      onDrop(acceptedFiles);
    },
    multiple: false,
    accept: { 'application/zip': ['.zip'], 'application/x-zip-compressed': ['.zip'] },
  });

  return (
    <>
      <Description>Files to analyze*</Description>
      {watch('uploaded_file') ? (
        // eslint-disable-next-line max-len
        <div className="border-success/50 bg-success/5 text-success-content mb-6 flex justify-center space-x-1 rounded-lg border-2 border-solid p-6">
          <DocumentIcon />
          <p className="underline">{(acceptedFiles[0] as FileWithPath).path}</p>
        </div>
      ) : (
        <>
          <div
            {...getRootProps()}
            // eslint-disable-next-line max-len
            className="mb-6 cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 p-6 hover:border-gray-500"
          >
            <input {...getInputProps()} />
            <div className="text-center">
              {isDragActive ? (
                <p className="text-gray-600">Drop zip file here...</p>
              ) : (
                <p className="text-gray-600">{`Drag 'n' drop zip file here, or click to browse file.`}</p>
              )}
            </div>
          </div>
          {errorMessage && <ErrorAlert>{errorMessage}</ErrorAlert>}
        </>
      )}
      <input type="hidden" {...register('uploaded_file', { required: true })} />
    </>
  );
}
