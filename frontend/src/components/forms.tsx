import { Control, FieldPath, FieldValues, UseFormStateReturn } from 'react-hook-form/dist/types';
import { Controller, ControllerRenderProps } from 'react-hook-form';
import { ControllerFieldState } from 'react-hook-form/dist/types/controller';
import React from 'react';

interface TextInputAdds {
  title?: string;
  subtitle?: string;
  bottomRight?: string;
}

interface TextInputProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>
  extends TextInputAdds {
  field: ControllerRenderProps<TFieldValues, TName>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<TFieldValues>;
}

export function TextInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ field, fieldState, title, subtitle, bottomRight }: TextInputProps<TFieldValues, TName>) {
  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text">{title}</span>
        <span className="label-text-alt">{subtitle}</span>
      </label>
      <input type="text" placeholder="Type here" className="input-bordered input w-full" {...field} />
      <label className="label">
        <span className="label-text-alt">{fieldState.error?.message}</span>
        <span className="label-text-alt">{bottomRight}</span>
      </label>
    </div>
  );
}

interface CTextInputProps<TFieldValues extends FieldValues = FieldValues> extends TextInputAdds {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
}

export function CTextInput<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  ...rest
}: CTextInputProps<TFieldValues>) {
  return <Controller name={name} control={control} render={(p) => <TextInput {...p} {...rest} />} />;
}

export function TextArea<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ field, fieldState, title, subtitle, bottomRight }: TextInputProps<TFieldValues, TName>) {
  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text">{title}</span>
        <span className="label-text-alt">{subtitle}</span>
      </label>
      <textarea placeholder="Type here" className="textarea-bordered textarea h-24 w-full" {...field} />
      <label className="label">
        <span className="label-text-alt">{fieldState.error?.message}</span>
        <span className="label-text-alt">{bottomRight}</span>
      </label>
    </div>
  );
}

export function CTextArea<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  ...rest
}: CTextInputProps<TFieldValues>) {
  return <Controller name={name} control={control} render={(p) => <TextArea {...p} {...rest} />} />;
}
