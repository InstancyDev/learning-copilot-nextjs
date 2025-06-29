'use client';

import { LearningCopilot } from '@/components/LearningCopilot';
import { Suspense } from 'react';

export default function AIAgentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LearningCopilot initialView="ai-agent" />
    </Suspense>
  );
} 