import React from 'react';

export const ResearcherIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="3" width="18" height="12" rx="2" ry="2"></rect>
    <line x1="7" y1="21" x2="17" y2="21"></line>
    <line x1="12" y1="15" x2="12" y2="21"></line>
    <polyline points="7 9 10 6 13 9 17 6"></polyline>
  </svg>
);
