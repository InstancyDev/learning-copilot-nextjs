import React, { useState } from 'react';
import TavusStreamingAvatar from '../components/TavusStreamingAvatar';
import { TavusPersonaConfig, SimpleTavusPersonaConfig, TavusTool } from '../types/tavus';

export default function TavusDemoPage() {
  const [apiKey, setApiKey] = useState('');
  const [replicaId, setReplicaId] = useState('');
  const [useAdvanced, setUseAdvanced] = useState(false);
  
  // Simple persona configuration
  const simplePersonaConfig: SimpleTavusPersonaConfig = {
    name: 'AI Customer Service Agent',
    systemPrompt: 'You are a helpful and friendly customer service representative. Be professional, empathetic, and solution-oriented.',
    contextPrompt: 'You are helping customers with their inquiries. Always be polite and try to resolve their issues efficiently.',
    replicaId: replicaId,
    llmModel: 'gpt-4',
    ttsEngine: 'tavus-turbo',
  };

  // Advanced persona configuration with tools and perception
  const weatherTool: TavusTool = {
    type: 'function',
    function: {
      name: 'get_current_weather',
      description: 'Get the current weather in a given location',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'The city and state, e.g. San Francisco, CA',
          },
          unit: {
            type: 'string',
            enum: ['celsius', 'fahrenheit'],
          },
        },
        required: ['location'],
      },
    },
  };

  const idDetectionTool: TavusTool = {
    type: 'function',
    function: {
      name: 'notify_if_id_shown',
      description: 'Use this function when a drivers license or passport is detected in the image with high confidence.',
      parameters: {
        type: 'object',
        properties: {
          id_type: {
            type: 'string',
            description: 'best guess on what type of ID it is',
          },
        },
        required: ['id_type'],
      },
    },
  };

  const advancedPersonaConfig: TavusPersonaConfig = {
    persona_name: 'Advanced Life Coach',
    system_prompt: 'As a Life Coach, you are a dedicated professional who specializes in helping individuals unlock their potential, overcome obstacles, and achieve their personal and professional goals.',
    pipeline_mode: 'full',
    context: 'Here are a few times that you have helped an individual make a breakthrough in their lives. You have experience with goal setting, motivation, and personal development.',
    default_replica_id: replicaId,
    layers: {
      llm: {
        model: 'gpt-4',
        tools: [weatherTool],
        extra_body: {
          temperature: 0.7,
        },
      },
      tts: {
        tts_engine: 'cartesia',
        voice_settings: {
          speed: 'normal',
          emotion: ['positivity:high', 'curiosity'],
        },
        tts_emotion_control: 'true',
        tts_model_name: 'sonic',
      },
      perception: {
        perception_model: 'raven-0',
        ambient_awareness_queries: [
          'Is the user showing an ID card?',
          'Does the user appear distressed or uncomfortable?',
          'Is the user holding any documents?',
        ],
        perception_tool_prompt: 'You have a tool to notify the system when an ID card is detected, named `notify_if_id_shown`. You MUST use this tool when a form of ID is detected.',
        perception_tools: [idDetectionTool],
      },
      stt: {
        stt_engine: 'tavus-turbo',
        participant_pause_sensitivity: 'high',
        participant_interrupt_sensitivity: 'high',
        hotwords: 'Coach, Life Coach, Goals, Motivation',
        smart_turn_detection: true,
      },
    },
  };

  const handleSessionStart = () => {
    console.log('Avatar session started');
  };

  const handleSessionEnd = () => {
    console.log('Avatar session ended');
  };

  const handleError = (error: Error) => {
    console.error('Avatar error:', error);
    alert(`Error: ${error.message}`);
  };

  if (!apiKey || !replicaId) {
    return (
      <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
        <h1>Tavus Streaming Avatar Demo</h1>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>
            Tavus API Key:
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Tavus API key"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>
            Replica ID:
          </label>
          <input
            type="text"
            value={replicaId}
            onChange={(e) => setReplicaId(e.target.value)}
            placeholder="Enter your replica ID (e.g., r79e1c033f)"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
            }}
          />
        </div>

        <p style={{ color: '#666', fontSize: '14px' }}>
          Get your API key and create a replica at{' '}
          <a href="https://platform.tavus.io" target="_blank" rel="noopener noreferrer">
            platform.tavus.io
          </a>
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Tavus Streaming Avatar Demo</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={useAdvanced}
            onChange={(e) => setUseAdvanced(e.target.checked)}
          />
          Use Advanced Persona Configuration (with tools & perception)
        </label>
      </div>

      <TavusStreamingAvatar
        apiKey={apiKey}
        replicaId={replicaId}
        personaConfig={useAdvanced ? advancedPersonaConfig : simplePersonaConfig}
        useSimplePersona={!useAdvanced}
        onSessionStart={handleSessionStart}
        onSessionEnd={handleSessionEnd}
        onError={handleError}
      />
      
      <div style={{ marginTop: '40px' }}>
        <h3>Configuration:</h3>
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px' 
        }}>
          <h4>{useAdvanced ? 'Advanced' : 'Simple'} Persona Features:</h4>
          {useAdvanced ? (
            <ul>
              <li><strong>Weather Tool:</strong> Can check current weather when asked</li>
              <li><strong>Visual Perception:</strong> Can detect ID cards and documents</li>
              <li><strong>Emotion Control:</strong> Enhanced TTS with emotion settings</li>
              <li><strong>Smart Turn Detection:</strong> Advanced conversation flow</li>
              <li><strong>Hotwords:</strong> Responds better to specific keywords</li>
            </ul>
          ) : (
            <ul>
              <li><strong>GPT-4 Integration:</strong> Smart conversational AI</li>
              <li><strong>Tavus Turbo TTS:</strong> Fast, natural speech synthesis</li>
              <li><strong>Standard STT:</strong> Reliable speech recognition</li>
              <li><strong>Customer Service Focus:</strong> Professional and helpful</li>
            </ul>
          )}
        </div>

        <h3>Instructions:</h3>
        <ol>
          <li>Click "Start Avatar" to initialize the streaming session</li>
          <li>Allow camera and microphone permissions when prompted</li>
          <li>Start talking to your AI avatar!</li>
          {useAdvanced && (
            <>
              <li>Try asking about the weather in different cities</li>
              <li>Show an ID card to test visual perception</li>
            </>
          )}
          <li>Click "End Conversation" when finished</li>
        </ol>
      </div>
    </div>
  );
}