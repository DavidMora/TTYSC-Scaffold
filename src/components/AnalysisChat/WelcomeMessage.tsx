'use client';

import React from 'react';

interface WelcomeMessageProps {
  firstName: string;
}

export function WelcomeMessage({ firstName }: Readonly<WelcomeMessageProps>) {
  return (
    <div
      style={{
        background: 'var(--sapSuccessBackground)',
        border: '1px solid var(--sapList_SelectionBorderColor)',
        borderRadius: '12px',
        padding: '1.25rem 1.25rem',
        color: 'var(--sapPrimaryTextColor)',
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: '1.125rem',
          marginBottom: '0.5rem',
          color: 'var(--sapPrimaryTextColor)',
        }}
      >
        <span style={{ marginRight: '0.5rem' }}>🔎👋</span>
        Welcome to the ✨ Talk to your Supply Chain, {firstName}!
      </div>

      <div
        style={{
          fontSize: '0.95rem',
          lineHeight: 1.6,
          marginBottom: '0.75rem',
        }}
      >
        This tool helps you analyze <strong>ODP data</strong> demand, supply,
        shortage, and excess trends using the latest available data. Simply ask
        your questions, and the tool will generate insights based on real-time
        operations data.
      </div>

      <div
        style={{
          fontWeight: 700,
          marginTop: '0.5rem',
          marginBottom: '0.25rem',
          color: 'var(--sapList_SelectionBorderColor)',
        }}
      >
        💡 Best Practices:
      </div>
      <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.8 }}>
        <li>
          Use <strong>filters</strong> whenever necessary to refine your
          analysis.
        </li>
        <li>Ask specific questions to get accurate insights.</li>
        <li>
          Explore trends to identify potential <strong>shortages</strong> and{' '}
          <strong>excess inventory</strong>, etc.
        </li>
      </ul>

      <div style={{ marginTop: '0.75rem', fontSize: '0.95rem' }}>
        📊 This tool is powered by the <strong>latest data</strong>, ensuring
        you receive up-to-date answers for better decision-making.
      </div>
    </div>
  );
}
