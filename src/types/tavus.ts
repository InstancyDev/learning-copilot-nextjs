export interface TavusTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, {
        type: string;
        description?: string;
        enum?: string[];
      }>;
      required?: string[];
    };
  };
}

export interface TavusLLMLayer {
  model?: string;
  base_url?: string;
  api_key?: string;
  tools?: TavusTool[];
  headers?: Record<string, string>;
  extra_body?: Record<string, any>;
}

export interface TavusTTSLayer {
  api_key?: string;
  tts_engine?: 'cartesia' | 'playht' | 'elevenlabs' | 'tavus-turbo';
  external_voice_id?: string;
  voice_settings?: {
    speed?: 'slow' | 'normal' | 'fast';
    emotion?: string[];
  };
  playht_user_id?: string;
  tts_emotion_control?: string;
  tts_model_name?: string;
}

export interface TavusPerceptionLayer {
  perception_model?: 'raven-0';
  ambient_awareness_queries?: string[];
  perception_tool_prompt?: string;
  perception_tools?: TavusTool[];
}

export interface TavusSTTLayer {
  stt_engine?: 'tavus-turbo' | 'deepgram' | 'whisper';
  participant_pause_sensitivity?: 'low' | 'medium' | 'high';
  participant_interrupt_sensitivity?: 'low' | 'medium' | 'high';
  hotwords?: string;
  smart_turn_detection?: boolean;
}

export interface TavusPersonaLayers {
  llm?: TavusLLMLayer;
  tts?: TavusTTSLayer;
  perception?: TavusPerceptionLayer;
  stt?: TavusSTTLayer;
}

export interface TavusPersonaConfig {
  persona_name: string;
  system_prompt: string;
  pipeline_mode?: 'full' | 'text_parrot' | 'audio_parrot';
  context?: string;
  default_replica_id?: string;
  layers?: TavusPersonaLayers;
}

// Simplified config for easy usage
export interface SimpleTavusPersonaConfig {
  name: string;
  systemPrompt: string;
  contextPrompt?: string;
  replicaId?: string;
  llmModel?: string;
  ttsEngine?: 'cartesia' | 'playht' | 'elevenlabs' | 'tavus-turbo';
  voiceId?: string;
  tools?: TavusTool[];
}

export interface TavusConversation {
  conversationId: string;
  meetingUrl: string;
}

export interface TavusPersonaResponse {
  persona_id: string;
}

export interface TavusConversationResponse {
  conversation_id: string;
  conversation_url: string;
  status: string;
}

export interface TavusConversationStatus {
  conversation_id: string;
  status: 'active' | 'ended' | 'pending';
  created_at: string;
  participants: Array<{
    id: string;
    name: string;
    joined_at: string;
  }>;
}