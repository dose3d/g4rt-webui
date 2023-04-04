import React from 'react';
import { useJobApi } from '../../api/jobs';
import { Controller, ControllerRenderProps } from 'react-hook-form';
import { FieldPath, FieldValues, UseFormStateReturn } from 'react-hook-form/dist/types';
import { ControllerFieldState } from 'react-hook-form/dist/types/controller';
import {
  Card,
  CardHeader,
  CardHeaderMain,
  CardHeaderSubTitle,
  CardHeaderTitle,
  CardsContainer,
  Margin,
  Page,
} from '../../components/layout';

interface TextInputProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> {
  field: ControllerRenderProps<TFieldValues, TName>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<TFieldValues>;
}

function TextInput<
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

export default function JobCreatePage() {
  const { handleSubmit, onSubmit, control } = useJobApi({
    formProps: { defaultValues: { title: '', description: '' }, reValidateMode: 'onSubmit' },
  });

  return (
    <Page>
      <Margin>
        <CardsContainer>
          <Card>
            <CardHeader>
              <CardHeaderMain>
                <CardHeaderTitle>Create a new job</CardHeaderTitle>
                <CardHeaderSubTitle>
                  After create, the new job will be added to queue. You can remove job from queue or break pending job.
                </CardHeaderSubTitle>
              </CardHeaderMain>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Controller name="title" control={control} render={(p) => <TextInput {...p} />} />
              <Controller name="description" control={control} render={(p) => <TextInput {...p} />} />
              <input type="submit" />
            </form>
          </Card>
        </CardsContainer>
      </Margin>
    </Page>
  );
}
