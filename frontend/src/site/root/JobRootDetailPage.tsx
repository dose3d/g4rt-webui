import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useJobRootFileDownload, useJobRootFileEntity } from "../../api/jobsRootFile";
import {
  Card,
  CardHeader,
  CardHeaderMain,
  CardHeaderTitle,
  CardsContainer,
  Margin,
  Page
} from "../../components/layout";
import { formatDate } from "../../utils/formatValues";
import { draw, openFile } from "jsroot";

async function LoadJsRoot(data: ArrayBuffer) {
  console.log(data);
  const file = await openFile(data);
  console.log(file.fKeys);
  const obj = await file.readObject("WorldGeometry");
  console.log(obj);
  draw('drawing', obj, '');
}

export default function JobRootDetailPage() {
  const { fileId } = useParams();
  const fId = parseInt(`${fileId}`);
  const { data } = useJobRootFileEntity(fId);
  const { data: rootFile, isSuccess } = useJobRootFileDownload(fId);

  useEffect(() => {
    if (isSuccess) {
      LoadJsRoot(rootFile).then();
    }
  }, [rootFile, isSuccess]);

  return (<Page>
    <Margin>
      <CardsContainer>
        <Card>
          <CardHeader>
            <CardHeaderMain>
              <CardHeaderTitle>{`#${data?.id}: ${data?.file_name}`}</CardHeaderTitle>
              <div className="text-xs font-bold text-gray-500">
                Job: {`#${data?.job.id}: ${data?.job.title}`}, Date: {formatDate(data?.job.updated_at)}
              </div>
            </CardHeaderMain>
          </CardHeader>

          <h3 className="mb-2 mt-4 font-bold">Details:</h3>
          <div id="drawing" style={{ width: '100%' }}></div>
        </Card>
      </CardsContainer>
    </Margin>
  </Page>);
}