import React from 'react';
import { FieldValues } from 'react-hook-form';
import { UseMutateAsyncFunction } from '@tanstack/react-query/src/types';
import { AxiosError } from 'axios';
import { DrfError } from '../drf-crud-client';
import { MutateOptions } from '@tanstack/react-query';
import cn from 'classnames';

interface DrfMutationProps<
  Request extends FieldValues = FieldValues,
  Response extends FieldValues = Request,
  TContext = undefined,
> {
  mutateAsync: UseMutateAsyncFunction<Response, AxiosError<DrfError<Request>, Request>, Request, TContext>;
  isLoading: boolean;
}

interface Props<Request extends FieldValues = FieldValues, Response extends FieldValues = Request, TContext = undefined>
  extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  drf: DrfMutationProps<Request, Response, TContext>;
  variables?: Request;
  mutateOptions?: MutateOptions<Response, AxiosError<DrfError<Request>, Request>, Request, TContext>;
  icon?: React.ReactNode;
}

function ActionButton<
  Request extends FieldValues = FieldValues,
  Response extends FieldValues = Request,
  TContext = undefined,
>({
  disabled,
  drf: { mutateAsync, isLoading },
  className,
  children,
  variables,
  mutateOptions,
  icon,
  ...rest
}: Props<Request, Response, TContext>) {
  const isDisabled = disabled || isLoading;
  const myClassName = cn(className, { loading: isLoading });
  return (
    <button
      disabled={isDisabled}
      onClick={() => mutateAsync(variables as unknown as Request, mutateOptions)}
      className={myClassName}
      {...rest}
    >
      {!isLoading && icon}
      {children}
    </button>
  );
}

export default ActionButton;
