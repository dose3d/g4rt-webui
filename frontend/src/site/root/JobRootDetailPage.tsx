import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useJobRootFileDownload, useJobRootFileEntity } from '../../api/jobsRootFile';
import {
  Card,
  CardHeader,
  CardHeaderMain,
  CardHeaderTitle,
  CardsContainer,
  Margin,
  Page,
} from '../../components/layout';
import { formatDate } from '../../utils/formatValues';
import { draw, openFile } from 'jsroot';

interface FKey {
  fClassName: string;
  fName: string;
  fTitle: string;
}

interface TFile {
  fKeys: FKey[];
  readObject: (fName: string) => Promise<any>;
}

export default function JobRootDetailPage() {
  const { fileId } = useParams();
  const fId = parseInt(`${fileId}`);
  const { data } = useJobRootFileEntity(fId);
  const { data: rootFile, isSuccess } = useJobRootFileDownload(fId);

  const [file, setFile] = useState<TFile | null>(null);
  const [keys, setKeys] = useState<FKey[]>([]);

  useEffect(() => {
    if (isSuccess) {
      openFile(rootFile).then((file: TFile) => {
        setFile(file);
        setKeys(file.fKeys);
      });
    }
  }, [rootFile, isSuccess]);

  return (
    <Page>
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

            <h3 className="mb-2 mt-4 font-bold">Log files:</h3>
            <div className="ml-4">
              <ol className="list-inside list-decimal">
                {keys.map((o, i) => (
                  <li key={i}>
                    {`${o.fName}: ${o.fClassName} - ${o.fTitle}`}
                    <button
                      className="btn-primary btn-xs btn ml-2"
                      onClick={() => {
                        file!.readObject(o.fName).then((obj) => {
                          draw('drawing', obj, '');
                        });
                      }}
                    >
                      Show
                    </button>
                  </li>
                ))}
              </ol>
            </div>

            <h3 className="mb-2 mt-4 font-bold">Details:</h3>
            <div id="drawing" style={{ width: '100%', height: '800px' }}></div>
          </Card>
        </CardsContainer>
      </Margin>
    </Page>
  );
}
