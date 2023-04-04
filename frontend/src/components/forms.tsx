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
  inputCN?: string;
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

interface LabelOutlineProps extends CommonAdds {
  error?: string;
  children: React.ReactNode;
}

function LabelOutline({ children, title, subtitle, bottomRight, error }: LabelOutlineProps) {
  const hasError = !!error;

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className={cn('label-text', { 'text-error': hasError })}>{title}</span>
        <span className={cn('label-text-alt', { 'text-error': hasError })}>{subtitle}</span>
      </label>
      {children}
      <label className="label">
        <span className={cn('label-text-alt', { 'text-error': hasError })}>{error}</span>
        <span className={cn('label-text-alt', { 'text-error': hasError })}>{bottomRight}</span>
      </label>
    </div>
  );
}

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
  inputCN,
}: TextInputProps<TFieldValues, TName>) {
  const hasError = !!fieldState.error?.message;

  return (
    <LabelOutline title={title} subtitle={subtitle} bottomRight={bottomRight} error={fieldState.error?.message}>
      <input
        type={type}
        placeholder={placeHolder}
        className={cn('input-bordered input w-full', inputCN, { 'input-error': hasError })}
        {...field}
      />
    </LabelOutline>
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
  inputCN,
}: TextAreaProps<TFieldValues, TName>) {
  const hasError = !!fieldState.error?.message;

  return (
    <LabelOutline title={title} subtitle={subtitle} bottomRight={bottomRight} error={fieldState.error?.message}>
      <textarea
        placeholder={placeHolder}
        className={cn('textarea-bordered textarea w-full', inputCN, height, { 'textarea-error': hasError })}
        {...field}
      />
    </LabelOutline>
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
