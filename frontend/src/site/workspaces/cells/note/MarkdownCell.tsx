import ReactMarkdown from 'react-markdown';
import React from 'react';

function MarkdownCell({ content }: { content: string }) {
  return <ReactMarkdown className="prose w-full max-w-none">{content}</ReactMarkdown>;
}

export default MarkdownCell;
