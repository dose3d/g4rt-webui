import { Control, FieldPath, FieldValues, UseFormStateReturn } from 'react-hook-form/dist/types';
import { Controller, ControllerRenderProps } from 'react-hook-form';
import { ControllerFieldState } from 'react-hook-form/dist/types/controller';
import React from 'react';
import cn from 'classnames';

interface CommonAdds {
  title?: string;
  subtitle?: string;
  bottomRight?: string;
  placeHolder?: string;
}

interface RFHAdds<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> {
  field: ControllerRenderProps<TFieldValues, TName>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<TFieldValues>;
}

interface ControlAdds<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
}

interface TextInputAdds extends CommonAdds {
  type?: string;
}

interface TextInputProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>
  extends TextInputAdds,
    RFHAdds<TFieldValues, TName> {}

export function TextInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  field,
  fieldState,
  title,
  subtitle,
  bottomRight,
  placeHolder,
  type = 'text',
}: TextInputProps<TFieldValues, TName>) {
  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text">{title}</span>
        <span className="label-text-alt">{subtitle}</span>
      </label>
      <input type={type} placeholder={placeHolder} className="input-bordered input w-full" {...field} />
      <label className="label">
        <span className="label-text-alt">{fieldState.error?.message}</span>
        <span className="label-text-alt">{bottomRight}</span>
      </label>
    </div>
  );
}

interface CTextInputProps<TFieldValues extends FieldValues = FieldValues>
  extends TextInputAdds,
    ControlAdds<TFieldValues> {}

export function CTextInput<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  ...rest
}: CTextInputProps<TFieldValues>) {
  return <Controller name={name} control={control} render={(p) => <TextInput {...p} {...rest} />} />;
}

interface TextAreaAdds extends CommonAdds {
  height?: string;
}

interface TextAreaProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>
  extends TextAreaAdds,
    RFHAdds<TFieldValues, TName> {}

export function TextArea<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  field,
  fieldState,
  title,
  subtitle,
  bottomRight,
  placeHolder,
  height = 'h-24',
}: TextAreaProps<TFieldValues, TName>) {
  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text">{title}</span>
        <span className="label-text-alt">{subtitle}</span>
      </label>
      <textarea placeholder={placeHolder} className={cn('textarea-bordered textarea w-full', height)} {...field} />
      <label className="label">
        <span className="label-text-alt">{fieldState.error?.message}</span>
        <span className="label-text-alt">{bottomRight}</span>
      </label>
    </div>
  );
}

interface CTextAreaProps<TFieldValues extends FieldValues = FieldValues>
  extends TextAreaAdds,
    ControlAdds<TFieldValues> {}

export function CTextArea<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  ...rest
}: CTextAreaProps<TFieldValues>) {
  return <Controller name={name} control={control} render={(p) => <TextArea {...p} {...rest} />} />;
}
