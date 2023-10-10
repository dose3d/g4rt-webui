import { FieldPath, FieldPathValue, FieldValues } from "react-hook-form/dist/types";
import { Controller } from "react-hook-form";
import ReactSelect, { GroupBase } from "react-select";
import React from "react";
import { CommonAdds, ControlAdds } from "./forms";



interface CReactSelectProps<TFieldValues extends FieldValues = FieldValues, Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>>
  extends CommonAdds,
    ControlAdds<TFieldValues> {
  options: {label: string, value: string}[];
}

export function CReactSelect<TFieldValues extends FieldValues = FieldValues>({
                                                                               control,
                                                                               name,
                                                                               options,
                                                                               ...rest
                                                                             }: CReactSelectProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <ReactSelect
          {...field}
          {...rest}
          isMulti
          options={options as FieldPathValue<TFieldValues, FieldPath<TFieldValues>>}
        />
      )}
    />
  );
}