import { Controller, FieldValues } from 'react-hook-form';
import ReactSelect, { MultiValue } from 'react-select';
import React from 'react';
import { CommonAdds, ControlAdds, LabelOutline } from './forms';
import cn from 'classnames';

interface Option<Value extends String | Number = String> {
  label: string;
  value: Value;
}

interface CReactSelectMultiProps<TFieldValues extends FieldValues = FieldValues, Value extends String | Number = String>
  extends CommonAdds,
    ControlAdds<TFieldValues> {
  options: Option<Value>[];
}

function convertValue<Value extends String | Number = String>(value: Value[], options: Option<Value>[]) {
  return (value || []).map((o) => options.find((v) => v.value == o));
}

function convertOnChange<Value extends String | Number = String>(v: MultiValue<Option<Value> | undefined>) {
  return v.map((o) => o?.value) as unknown as Value;
}

export function CReactSelectMulti<
  TFieldValues extends FieldValues = FieldValues,
  Value extends String | Number = String,
>({ control, name, options, ...rest }: CReactSelectMultiProps<TFieldValues, Value>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ...field } }) => (
        <ReactSelect
          value={convertValue(value, options)}
          onChange={(e) => onChange(convertOnChange(e))}
          {...field}
          {...rest}
          isMulti
          options={options}
        />
      )}
    />
  );
}

export function CReactSelectMultiInput<
  TFieldValues extends FieldValues = FieldValues,
  Value extends String | Number = String,
>({
  control,
  name,
  options,
  title,
  subtitle,
  bottomRight,
  placeHolder,
  inputCN,
  ...rest
}: CReactSelectMultiProps<TFieldValues, Value>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ...field }, fieldState }) => (
        <LabelOutline title={title} subtitle={subtitle} bottomRight={bottomRight} error={fieldState.error?.message}>
          <ReactSelect
            value={convertValue(value, options)}
            onChange={(e) => onChange(convertOnChange(e))}
            {...field}
            {...rest}
            placeholder={placeHolder}
            classNames={{ control: () => cn(inputCN, { 'input-error': !!fieldState.error?.message }) }}
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                borderColor: undefined,
                '&:hover': {
                  borderColor: undefined,
                },
              }),
            }}
            isMulti
            options={options}
          />
        </LabelOutline>
      )}
    />
  );
}
