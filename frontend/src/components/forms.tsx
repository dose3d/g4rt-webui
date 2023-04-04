import { FieldPath, FieldValues, UseFormStateReturn } from 'react-hook-form/dist/types';
import { ControllerRenderProps } from 'react-hook-form';
import { ControllerFieldState } from 'react-hook-form/dist/types/controller';
import React from 'react';

interface TextInputProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> {
  field: ControllerRenderProps<TFieldValues, TName>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<TFieldValues>;
}

export function TextInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ field, fieldState, formState }: TextInputProps<TFieldValues, TName>) {
  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text">What is your name?</span>
        <span className="label-text-alt">Top Right label</span>
      </label>
      <input type="text" placeholder="Type here" className="input-bordered input w-full" {...field} />
      <label className="label">
        <span className="label-text-alt">{fieldState.error?.message}</span>
        <span className="label-text-alt">Bottom Right label</span>
      </label>
    </div>
  );
}
