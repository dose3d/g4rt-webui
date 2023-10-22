import ReactMarkdown from 'react-markdown';
import React from 'react';
import { WorkspaceCellEntity } from '../../../../api/workspaceCells';

function MarkdownCell({ cell: { content } }: { cell: WorkspaceCellEntity }) {
  return <ReactMarkdown className="prose w-full max-w-none">{content}</ReactMarkdown>;
}

export default MarkdownCell;
