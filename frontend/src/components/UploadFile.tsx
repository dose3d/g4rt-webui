import React from 'react';
import { useDropzone } from 'react-dropzone';
import { UseUploadRequest, useUploadRequest } from '../drf-crud-client';
import { ErrorAlert } from './layout';

function UploadFile<R, E>(params: UseUploadRequest<R, E>) {
  const { onDrop, errorMessage } = useUploadRequest(params);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <>
      <div
        {...getRootProps()}
        className="mb-6 cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-gray-500"
      >
        <input {...getInputProps()} />
        <div className="text-center">
          {isDragActive ? (
            <p className="text-gray-600">Drop the files here...</p>
          ) : (
            <p className="text-gray-600">{`Drag 'n' drop some files here, or click to select files.`}</p>
          )}
        </div>
      </div>
      {errorMessage && <ErrorAlert>{errorMessage}</ErrorAlert>}
    </>
  );
}

export default UploadFile;
