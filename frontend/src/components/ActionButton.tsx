import React from 'react';
import { FieldValues } from 'react-hook-form';
import { UseMutateAsyncFunction } from '@tanstack/react-query/src/types';
import { AxiosError } from 'axios';
import { DrfError } from '../drf-crud-client';
import { MutateOptions, UseMutateFunction } from '@tanstack/react-query';
import cn from 'classnames';

interface DrfMutationProps<
  Request extends FieldValues = FieldValues,
  Response extends FieldValues = Request,
  TContext = undefined,
> {
  mutate: UseMutateFunction<Response, AxiosError<DrfError<Request>, Request>, Request, TContext>;
  isLoading: boolean;
}

interface Props<Request extends FieldValues = FieldValues, Response extends FieldValues = Request, TContext = undefined>
  extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  drf: DrfMutationProps<Request, Response, TContext>;
  variables?: Request;
  mutateOptions?: MutateOptions<Response, AxiosError<DrfError<Request>, Request>, Request, TContext>;
  icon?: React.ReactNode;
  confirm?: string;
}

function ActionButton<
  Request extends FieldValues = FieldValues,
  Response extends FieldValues = Request,
  TContext = undefined,
>({
  disabled,
  drf: { mutate, isLoading },
  className,
  children,
  variables,
  mutateOptions,
  icon,
  confirm: confirmMessage,
  ...rest
}: Props<Request, Response, TContext>) {
  const isDisabled = disabled || isLoading;
  const myClassName = cn(className, { loading: isLoading });

  const onClick = () => {
    // TODO: usage modal dialog instead deprecated window.confirm dialog
    if ((confirmMessage && confirm(confirmMessage)) || !confirmMessage) {
      // TODO: handle errors
      const mo = {
        onError: () => {
          alert('Error!');
        },
        ...mutateOptions,
      };

      mutate(variables as unknown as Request, mo);
    }
  };

  return (
    <button disabled={isDisabled} onClick={onClick} className={myClassName} {...rest}>
      {!isLoading && icon}
      {children}
    </button>
  );
}

export default ActionButton;
