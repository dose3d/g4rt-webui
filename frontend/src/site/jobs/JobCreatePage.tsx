import React from 'react';
import { useJobApi } from '../../api/jobs';
import { Controller } from 'react-hook-form';
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
import { TextInput } from '../../components/forms';

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
