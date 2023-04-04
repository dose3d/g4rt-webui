import React from 'react';
import { useJobApi } from '../../api/jobs';
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
import { CTextArea, CTextInput } from "../../components/forms";

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
              <CTextInput name="title" control={control} title="Job title" />
              <CTextArea name="description" control={control} title="Description of the job" />
              <input type="submit" />
            </form>
          </Card>
        </CardsContainer>
      </Margin>
    </Page>
  );
}
