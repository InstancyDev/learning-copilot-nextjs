import { NextApiRequest, NextApiResponse } from 'next';

interface TavusWebhookEvent {
  event_type: 'conversation.started' | 'conversation.ended' | 'participant.joined' | 'participant.left';
  conversation_id: string;
  timestamp: string;
  data?: any;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const event: TavusWebhookEvent = req.body;
    
    console.log('Received Tavus webhook:', event.event_type, event.conversation_id);
    
    switch (event.event_type) {
      case 'conversation.started':
        console.log('Conversation started:', event.conversation_id);
        // Handle conversation start logic
        break;
        
      case 'conversation.ended':
        console.log('Conversation ended:', event.conversation_id);
        // Handle cleanup, save transcript, analytics, etc.
        break;
        
      case 'participant.joined':
        console.log('Participant joined:', event.data?.participant);
        // Handle participant join logic
        break;
        
      case 'participant.left':
        console.log('Participant left:', event.data?.participant);
        // Handle participant leave logic
        break;
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}