import { DailyCall } from '@daily-co/daily-js';
import {TavusPersonaConfig, TavusConversationStatus ,TavusPersonaResponse, SimpleTavusPersonaConfig, TavusConversation, TavusConversationResponse } from '@/types/tavus';

export class TavusClient {
  private apiKey: string;
  private baseURL = 'https://tavusapi.com';
  private conversationId: string | null = null;
  private dailyMeetingUrl: string | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

 // 1. Fix the createPersona method in lib/tavus.ts
async createPersona(config: TavusPersonaConfig): Promise<string> {
  // Validate required fields
  if (!config.persona_name || !config.system_prompt) {
    throw new Error('persona_name and system_prompt are required');
  }

  // Build payload with required fields first
  const payload: any = {
    persona_name: config.persona_name,
    system_prompt: config.system_prompt,
    pipeline_mode: config.pipeline_mode || 'full',
  };

  // Add optional fields only if they exist and are not empty
  if (config.context && config.context.trim()) {
    payload.context = config.context;
  }

  if (config.default_replica_id && config.default_replica_id.trim()) {
    payload.default_replica_id = config.default_replica_id;
  }

  if (config.layers && Object.keys(config.layers).length > 0) {
    payload.layers = config.layers;
  }

  console.log('Sending payload:', JSON.stringify(payload, null, 2));

  const response = await fetch(`${this.baseURL}/v2/personas`, {
    method: 'POST',
    headers: {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', errorText);
    throw new Error(`Failed to create persona: ${response.statusText} - ${errorText}`);
  }

  const data: TavusPersonaResponse = await response.json();
  return data.persona_id;
}

// 2. Fix the createSimplePersona method in lib/tavus.ts
async createSimplePersona(config: SimpleTavusPersonaConfig): Promise<string> {
  if (!config.name?.trim() || !config.systemPrompt?.trim()) {
    throw new Error('Persona name and system prompt are required and cannot be empty');
  }

  const personaConfig: TavusPersonaConfig = {
    persona_name: config.name.trim(),
    system_prompt: config.systemPrompt.trim(),
    pipeline_mode: 'full',
  };

  // Add optional fields only if provided and not empty
  if (config.contextPrompt?.trim()) {
    personaConfig.context = config.contextPrompt.trim();
  }

  if (config.replicaId?.trim()) {
    personaConfig.default_replica_id = config.replicaId.trim();
  }

  // Build layers only if we have valid configurations
  const layers: any = {};

  if (config.llmModel?.trim()) {
    layers.llm = { model: config.llmModel.trim() };
  }

  if (config.ttsEngine?.trim()) {
    layers.tts = { tts_engine: config.ttsEngine.trim() };
  }

  // Only add layers if we have configurations
  if (Object.keys(layers).length > 0) {
    personaConfig.layers = layers;
  }

  return this.createPersona(personaConfig);
}

  async createConversation(
  replicaId: string,
  personaId: string,
  conversationName = 'Streaming Avatar Session'
): Promise<TavusConversation> {
  try {
    // Validate required fields
    if (!replicaId?.trim()) {
      throw new Error('replica_id is required and cannot be empty');
    }
    if (!personaId?.trim()) {
      throw new Error('persona_id is required and cannot be empty');
    }

    // Build payload - DO NOT include callback_url if empty
    const payload: any = {
      replica_id: replicaId.trim(),
      persona_id: personaId.trim(),
      conversation_name: conversationName.trim(),
      properties: {
        max_call_duration: 3600,
        participant_left_timeout: 60,
        participant_absent_timeout: 300,
        enable_recording: false,
      },
    };

    // Only add callback_url if it's a valid URL
    const callbackUrl = process.env.NEXT_PUBLIC_FLOWISE_API_HOST;
    if (callbackUrl && callbackUrl.trim() && callbackUrl.startsWith('http')) {
      payload.callback_url = callbackUrl.trim();
    }

    console.log('=== CONVERSATION DEBUG ===');
    console.log('Creating conversation with payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${this.baseURL}/v2/conversations`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Conversation creation error:', errorText);
      throw new Error(`Failed to create conversation: HTTP ${response.status} - ${errorText}`);
    }

    const data: TavusConversationResponse = await response.json();
    console.log('Conversation created successfully:', data);
    
    this.conversationId = data.conversation_id;
    this.dailyMeetingUrl = data.conversation_url;

    return {
      conversationId: this.conversationId,
      meetingUrl: this.dailyMeetingUrl,
    };

  } catch (error) {
    console.error('=== CONVERSATION ERROR ===');
    console.error('Error details:', error);
    throw error;
  }
}

// Also add this debugging method to test your setup:
async testAPIConnection(): Promise<void> {
  console.log('=== API CONNECTION TEST ===');
  console.log('Base URL:', this.baseURL);
  console.log('API Key present:', !!this.apiKey);
  console.log('API Key preview:', this.apiKey ? `${this.apiKey.substring(0, 8)}...` : 'MISSING');
  
  try {
    const response = await fetch(`${this.baseURL}/v2/personas`, {
      method: 'GET',
      headers: {
        'x-api-key': this.apiKey,
        'Accept': 'application/json',
      },
    });
    
    console.log('API Test Response Status:', response.status);
    
    if (response.status === 401) {
      throw new Error('Invalid API key - check your Tavus API key');
    }
    
    if (response.status !== 200) {
      const errorText = await response.text();
      throw new Error(`API connection failed: ${response.status} - ${errorText}`);
    }
    
    console.log('✅ API connection successful');
    
  } catch (error) {
    console.error('❌ API connection failed:', error);
    throw error;
  }
}

  async getConversationStatus(): Promise<TavusConversationStatus> {
    if (!this.conversationId) {
      throw new Error('No active conversation');
    }

    const response = await fetch(
      `${this.baseURL}/v2/conversations/${this.conversationId}`,
      {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get conversation status: ${response.statusText}`);
    }

    return await response.json();
  }

  async endConversation(): Promise<void> {
    if (!this.conversationId) {
      throw new Error('No active conversation to end');
    }

    const response = await fetch(
      `${this.baseURL}/v2/conversations/${this.conversationId}`,
      {
        method: 'DELETE',
        headers: {
          'x-api-key': this.apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to end conversation: ${response.statusText}`);
    }

    this.conversationId = null;
    this.dailyMeetingUrl = null;
  }

  getCurrentConversationId(): string | null {
    return this.conversationId;
  }

  getCurrentMeetingUrl(): string | null {
    return this.dailyMeetingUrl;
  }
} 