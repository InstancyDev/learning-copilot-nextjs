import dynamic from 'next/dynamic';

const FlowiseAIAssistant = dynamic(
  () => import('./FlowiseAIAssistant'),
  { ssr: false }
);

export default FlowiseAIAssistant; 