
import React from 'react';

interface CodeBlockProps {
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  return (
    <pre className="bg-bg-main text-sm text-primary p-4 rounded-md overflow-x-auto border border-border-main">
      <code>
        {code}
      </code>
    </pre>
  );
};

export default CodeBlock;