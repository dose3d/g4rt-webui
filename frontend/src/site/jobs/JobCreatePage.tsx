import React from "react";
import { useJobApi } from "../../api/jobs";
import { Controller, ControllerRenderProps } from "react-hook-form";
import { FieldPath, FieldValues, UseFormStateReturn } from "react-hook-form/dist/types";
import { ControllerFieldState } from "react-hook-form/dist/types/controller";

interface TextInputProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> {
  field: ControllerRenderProps<TFieldValues, TName>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<TFieldValues>;
}

function TextInput<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({field, fieldState, formState}: TextInputProps<TFieldValues, TName>) {
  return (
    <div className="form-control w-full max-w-xs">
      <label className="label">
        <span className="label-text">What is your name?</span>
        <span className="label-text-alt">Top Right label</span>
      </label>
      <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs" {...field} />
      <label className="label">
        <span className="label-text-alt">{fieldState.error?.message}</span>
        <span className="label-text-alt">Bottom Right label</span>
      </label>
    </div>
  )
}

export default function JobCreatePage() {
  const {handleSubmit, onSubmit, control} = useJobApi({formProps: {defaultValues: {title: "", description: ""}, reValidateMode: "onSubmit"}});

  return (<section>
    <div>Create job</div>
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="title"
        control={control}
        render={(p) => <TextInput {...p} />}
      />
      <Controller
        name="description"
        control={control}
        render={(p) => <TextInput {...p} />}
      />

      <input type="submit" />
    </form>
  </section>);
}
