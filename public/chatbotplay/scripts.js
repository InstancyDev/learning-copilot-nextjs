//import Chatbot1 from "https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js";
//import Chatbot2 from "https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js";

import Chatbot1 from "https://instancycommoncontent.blob.core.windows.net/flowise-embed/1.2.5.3/dist/web.js";
import Chatbot2 from "https://instancycommoncontent.blob.core.windows.net/flowise-embed/1.2.5.3/dist/web.js";



let messageHistory = [];
const _sessionKey = sessionStorage.getItem("sessionKey");
const userName = sessionStorage.getItem(_sessionKey + "_UNAME"); 
const docSessionID = _sessionKey.split("_")[2]; 
const userAvatarSrc = `https://ui-avatars.com/api/?name=${userName.charAt(0)}&background=random`;  
var roleplaySessionID = "";
var interval = null;
var chatbotplay_userContext = JSON.parse(sessionStorage.getItem('chatbotplay_userContext'));
var botSettings;
if(chatbotplay_userContext != null){
  botSettings = JSON.parse(chatbotplay_userContext.BotSettings);
} 
debugger;
    
  //chatbotConfig.theme.chatWindow.welcomeMessage = rolePlayConfigData.WelcomeMessage;
  //chatbotConfig2.theme.chatWindow.welcomeMessage = rolePlayConfigData.EvaluationIntroMessage;
  if(sessionStorage.getItem("old_sessionKey") != null){
    if(sessionStorage.getItem("old_sessionKey") != _sessionKey){
      sessionStorage.removeItem("old_sessionKey"); 
    }
  } 

const mediaElement_avtar = document.querySelector('#mediaElement_avtar');
const canvasElement_avtar = document.querySelector('#canvasElement_avtar');

const mediaElement_patient = document.querySelector('#mediaElement_patient');
const canvasElement_patient = document.querySelector('#canvasElement_patient');
 
const SERVER_URL = 'https://api.heygen.com';

const avatar_evaluator = "Eric_public_pro2_20230608";
const avatar_patient = "Susan_public_2_20240328";

const voice_evealuator = "bfc6d0242de24106a104339f0618b68d";
const voice_patient = "71b0aa6499f6458e8b040818a017db1f";
 
const show_patient = false;
let isRendering = false;
var renderID = 0;

 


let allMessage = null;
let allMessage_str = '';


let lastUserMessage = "";
let lastApiMessage = "";

let sessionInfo_avatar = null;
let peerConnection_avtar = null;

let sessionInfo_patient = null;
let peerConnection_patient = null;

let is_evaluator = false;
let is_session_started = false;

let isGuide_on = false; 

//const iconContainer = document.getElementById('iconContainer');
//const chatIcon = document.getElementById('chatIcon');
//const dropdown = document.getElementById('dropdown');
const feedbackContainer = document.getElementById('feedbackContainer');  

// Populate chat messages
function populateMessages() {
  feedbackContainer.innerHTML = '';

  if(isGuide_on){
    messageHistory.forEach(msg => {
      const row = document.createElement("div");
      row.className = `message-row ${msg.type}`;
      
      const avatar = document.createElement("div");
      avatar.className = "avatar";
      
      // Use <img> instead of text
      const avatarImg = document.createElement("img");
      avatarImg.src = msg.type === "userMessage" ? userAvatarSrc : simulatedAvatarSrc;
      avatarImg.alt = msg.type === "userMessage" ? "User Avatar" : "Simulated Avatar";
      avatarImg.style.width = "100%";
      avatarImg.style.height = "100%";
      avatarImg.style.borderRadius = "50%"; // make it circular
      
      avatar.appendChild(avatarImg);
      
      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.textContent = msg.message;
      
      row.appendChild(avatar);
      row.appendChild(bubble);
      
      feedbackContainer.appendChild(row);
      });
  }
  else{
    feedbackContainer.innerHTML = '<div class="centered-text">Please complete the roleplay before proceeding to the feedback.</div>';
  }
}
 function toggleFlows(type)
 {
  const cardFeedback = document.getElementById('card_feedback');
      const cardChatbot = document.getElementById('card_chatbot');
      if(isGuide_on){
        if (type === 'roleplay') {
          cardFeedback.style.display = 'block';
          cardChatbot.style.display = 'none';
          populateMessages();
        } else if (type === 'feedback') {
          cardFeedback.style.display = 'none';
          cardChatbot.style.display = 'flex';
        }
      }
      else{
        if (type === 'roleplay') {
          cardFeedback.style.display = 'none';
          cardChatbot.style.display = 'flex';
        } else if (type === 'feedback') {
          cardFeedback.style.display = 'block';
          cardChatbot.style.display = 'none';
          populateMessages();
        }
      }
 }   
  /* chatMessages.forEach(msg => {
  const div = document.createElement('div');
  div.className = 'chat-message';
  div.textContent = msg;
  dropdown.appendChild(div);
  }); */

  
  // Toggle dropdown
 /*  chatIcon.addEventListener('click', () => {
  const isVisible = dropdown.style.display === 'block';
  dropdown.style.display = isVisible ? 'none' : 'block';
  const container = document.getElementById('card_chatbot');
  container.style.display = isVisible ? 'block' : 'none';
  if (!isVisible) {
    populateMessages();
  }
  });
  document.querySelectorAll('.chat-icon').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chat-icon').forEach(b => b.classList.remove('selected-icon'));
      btn.classList.add('selected-icon');
      const type = btn.dataset.type;
      console.log(`Selected icon: ${type}`);
    });
  }); */

  document.querySelectorAll('.chat-icon').forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle selected class
      document.querySelectorAll('.chat-icon').forEach(b => b.classList.remove('selected-icon'));
      btn.classList.add('selected-icon');

      const type = btn.dataset.type;
      toggleFlows(type.toString());
      
    });
  });

   
	
function getSessionStorage(key) {
  const data = sessionStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}
// Prevent navigation back to the start page
window.onpageshow = function (event) {
  if (event.persisted) {
    history.forward();
  }
};


function showLoadingOverlay(message) {
  // Set the message dynamically
  document.getElementById('loadingMessage').textContent = message || "Loading, please wait..."; // Default message if none provided

  // Show the overlay
  document.getElementById('loadingOverlay').style.display = 'flex';
}

// Function to hide the overlay
function hideLoadingOverlay() {
  document.getElementById('loadingOverlay').style.display = 'none';
}
var userSessionKey = "userContext_https://" + window.location.hostname;
console.log(userSessionKey);
var userContext = JSON.parse(sessionStorage.getItem(userSessionKey));
const chatbotConfig = {
  chatflowid: chatbotplay_userContext.BotID.toLowerCase(),
  apiHost: 'https://edemoaiagentstudio.instancy.com:4500',//chatbotplay_userContext.APIHost,
  streaming: false,
  chatflowConfig: { 
      vars: {
        "authorizationCode": userContext.JwtToken,
        "emailId": userContext.EmailAddress,
        "clientUrl": userContext.ClientURL,
        "siteId": userContext.SiteID.toString(),
        "userId": userContext.UserID.toString(),
        "orgUnitId": userContext.OrgUnitID,
        "Language": userContext.Language,
        "webAPIURL": userContext.jsWebAPIUrl, 
        "UserSessionID": userContext.SessionID,
        "sessionId": userContext.SessionID, 
      }, 
  },
  observersConfig: {
    observeUserInput: (userInput) => {
      console.log({ "userInput": userInput });
      lastUserMessage = userInput; // Update last user message
    },
    observeMessages: (messages) => {
      const userMessages = messages.filter((message) => message.type === "userMessage");
      const apiMessages = messages.filter((message) => message.type === "apiMessage");

      allMessage = messages;
      if(!isGuide_on){
        messageHistory = messages;
      }
      

      lastUserMessage = userMessages.slice(-1)[0];
      lastApiMessage = apiMessages.slice(-1)[0];
    },
    observeLoading: async (loading) => {
      if (!loading) {
        console.log("lastUserMessage", lastUserMessage);
        console.log("lastApiMessage", lastApiMessage);

        if (window.sendFloatingMessage && lastApiMessage && lastApiMessage.message) {
          window.sendFloatingMessage(lastApiMessage.message);
        }
        if (lastUserMessage.message && lastUserMessage.message.toLowerCase().includes(concludeText.toLowerCase()) || lastApiMessage.message && lastApiMessage.message.toLowerCase().includes(concludeText.toLowerCase())) {
          console.log(concludeText.toLowerCase());
          const chatbotElement = document.getElementById('myChatbot');
          const evaluatorElement = document.getElementById('evaluator');
          is_evaluator = true;
          var resp_patient = { "duration_ms": 100 };
          if (lastApiMessage && sessionInfo_patient) {
            resp_patient = await talktoPatient(lastApiMessage.message);
            //renderCanvas_patient();
            console.log("in conclude finish talking..");
          }
          setTimeout(async function () {
            console.log("in setTimeout");
            let allMessage_str = "";
            console.log("allMessage", allMessage_str);

            allMessage.forEach((message) => {
              allMessage_str += message.message + '\n';
            });

            console.log("allMessage_str", allMessage_str);
            chatbotConfig2.chatflowConfig.promptValues.messages = JSON.stringify(allMessage);
            const container = document.getElementById('card_chatbot');

            // Remove old chatbot
            const oldChatbot = document.getElementById('myChatbot');
            if (oldChatbot) {
              container.removeChild(oldChatbot);
            }

            // Create a new chatbot element
            const newChatbot = document.createElement('flowise-fullchatbot');
            newChatbot.id = 'myChatbot';
            container.appendChild(newChatbot);
            isGuide_on = true;    
            if (chatbotElement) {
              chatbotElement.style.display = 'none';
            } else {
              console.warn('Element #myChatbot not found.');
            }

            if (evaluatorElement) {
              evaluatorElement.style.display = 'flex';
            } else {
              console.warn('Element #evaluator not found.');
            }
            console.log("session key", _sessionKey);
            let storedItem = localStorage.getItem(evaluatorchatflowID + "_EXTERNAL");
            let chatData;

            // Check if the item is present in localStorage
            if (storedItem) {
              chatData = { chatHistory: [] };
            } else {
              // Initialize chatData if the item doesn't exist
              chatData = { chatHistory: [] };
            }

            // New entries to add at the beginning
            let newEntries = [];// allMessage;
            newEntries.push({
              "agentReasoning": [],
              "message": intro_evaluator,
              "messageId": "4fab2984-6916-44e8-899b-552dd436b196",
              "type": "apiMessage"
            });

            // Adding the new entries to the start of the chatHistory array
            chatData.chatHistory.unshift(...newEntries); 

            // Reset lastApiMessage
            lastApiMessage = null; 
        }, resp_patient.duration_ms??1000);

        }
        else { 
        }  
      }
    },
  },
  theme: {
    button: {
      backgroundColor: botSettings.button.backgroundColor,
      right: botSettings.button.right,
      bottom: botSettings.button.bottom,
      size: botSettings.button.size,
      dragAndDrop: true,
      iconColor: botSettings.button.iconColor,
      customIconSrc: botSettings.titleAvatarSrc,
      autoWindowOpen: {
          autoOpen: true,
          openDelay: 2,
          autoOpenOnMobile: false
      }
  },
  tooltip: {
      showTooltip: true,
      tooltipMessage: botSettings.tooltip.tooltipMessage,
      tooltipBackgroundColor: botSettings.tooltip.tooltipBackgroundColor,
      tooltipTextColor: botSettings.tooltip.tooltipTextColor,
      tooltipFontSize: botSettings.tooltip.tooltipFontSize
  }, 
  customCSS: ``,
    chatWindow: {
      showTitle: true,
      title: botSettings.title,
      titleAvatarSrc: botSettings.titleAvatarSrc, //./assets/instancy28.png
      showAgentMessages: true,
      welcomeMessage: botSettings.welcomeMessage,
      errorMessage: botSettings.errorMessage,
      backgroundColor: botSettings.backgroundColor, 
      fontSize: 16,
      poweredByTextColor: botSettings.poweredByTextColor,
      renderHTML: true,
      botMessage: {
        backgroundColor: botSettings.botMessage.backgroundColor,
        textColor: "#000000",
        showAvatar: true,
        avatarSrc: botSettings.botMessage.avatarSrc,
      },
      userMessage: {
        backgroundColor: botSettings.userMessage.backgroundColor,
        textColor: botSettings.userMessage.textColor,
        showAvatar: botSettings.userMessage.showAvatar,
        avatarSrc: botSettings.userMessage.avatarSrc,
      },
      textInput: {
        placeholder: botSettings.userMessage.placeholder,
        backgroundColor: botSettings.userMessage.backgroundColor,
        textColor: botSettings.userMessage.textColor,
        sendButtonColor: botSettings.textInput.sendButtonColor, 
        autoFocus: true,
        sendMessageSound: true,
        receiveMessageSound: true,
      },
      feedback: {
        color: '#007bff',
      },
      footer: {
        textColor: botSettings?.footer?.textColor || '#FFFFFF',
        text: botSettings?.footer?.text || '',
        company: botSettings?.footer?.company || '',
        companyLink: botSettings?.footer?.companyLink || ''
      }
    }
  }
};   

async function initialization() {
  //alert(rolePlayConfigData.SimulatedParticipantRoleDescription);
  Chatbot2.initFull(chatbotConfig);

  updateStatus("please wait while we are loading the avatar.");
  if (show_patient) {
    showLoadingOverlay("Please wait while we are loading the patient avatar.");
    await createNewSession_patient(avatar_patient, voice_patient);
    const checkSessionInterval = setInterval(async () => {
      if (sessionInfo_patient && is_session_started) {
        clearInterval(checkSessionInterval); // Clear the interval once session info is available
        talktoPatient(intro_roleplay);
        hideLoadingOverlay();
        is_session_started = false;
      }
    }, 5000);

  }


}
// Initialize Chatbot with the configuration object
initialization();


function updateStatus(message, duration = 3000) {
  // // Create a new toast element
  // const toast = document.createElement('div');
  // toast.className = 'toast';
  // toast.innerHTML = message;

  // // Append it to the toast container
  // const toastContainer = document.getElementById('toast-container');
  // toastContainer.appendChild(toast);

  // // Show the toast
  // setTimeout(() => {
  //   toast.classList.add('show');
  // }, 100);

  // // Hide and remove the toast after the specified duration
  // setTimeout(() => {
  //   toast.classList.remove('show');
  //   toast.classList.add('hide');

  //   // Remove the toast element from DOM after the fade-out effect
  //   setTimeout(() => {
  //     toastContainer.removeChild(toast);
  //   }, 500);
  // }, duration);
}

function onMessage(event) {
  const message = event.data;
  console.log('Received message:', message);
}

async function createNewSession_patient(avatar_name, voice_name) {
  updateStatus('Creating new session... please wait');

  // call the new interface to get the server's offer SDP and ICE server to create a new RTCPeerConnection
  sessionInfo_patient = await newSession('low', avatar_name, voice_name);
  const { sdp: serverSdp, ice_servers2: iceServers } = sessionInfo_patient;

  // Create a new RTCPeerConnection
  peerConnection_patient = new RTCPeerConnection({ iceServers: iceServers });

  // When audio and video streams are received, display them in the video element
  peerConnection_patient.ontrack = (event) => {
    console.log('Received the track');
    if (event.track.kind === 'audio' || event.track.kind === 'video') {
      mediaElement_patient.srcObject = event.streams[0];
    }
  };

  // When receiving a message, display it in the status element
  peerConnection_patient.ondatachannel = (event) => {
    const dataChannel = event.channel;
    dataChannel.onmessage = onMessage;
  };

  // Set server's SDP as remote description
  const remoteDescription = new RTCSessionDescription(serverSdp);
  await peerConnection_patient.setRemoteDescription(remoteDescription);

  updateStatus('Session creation completed');
  await startAndDisplaySession_patient();
}

async function startAndDisplaySession_patient() {
  if (!sessionInfo_patient) {
    updateStatus('Please create a connection first');
    return;
  }

  updateStatus('Starting session... please wait');

  // Create and set local SDP description
  const localDescription = await peerConnection_patient.createAnswer();
  await peerConnection_patient.setLocalDescription(localDescription);

  // When ICE candidate is available, send to the server
  peerConnection_patient.onicecandidate = ({ candidate }) => {
    console.log('Received ICE candidate:', candidate);
    if (candidate) {
      handleICE(sessionInfo_patient.session_id, candidate.toJSON());
    }
  };

  // When ICE connection state changes, display the new state
  peerConnection_patient.oniceconnectionstatechange = (event) => {
    updateStatus(
      `ICE connection state changed to: ${peerConnection_patient.iceConnectionState}`,
    );
  };

  // Start session
  await startSession(sessionInfo_patient.session_id, localDescription);

  var receivers = peerConnection_patient.getReceivers();

  is_session_started = true;

  receivers.forEach((receiver) => {
    receiver.jitterBufferTarget = 500
  });

  updateStatus('Session started successfully');
}

// start the session
async function startSession(session_id, sdp) {
  const response = await fetch(`${SERVER_URL}/v1/streaming.start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({ session_id, sdp }),
  });
  if (response.status === 500) {
    console.error('Server error');
    updateStatus(
      'Server Error. Please ask the staff if the service has been turned on',
    );
    throw new Error('Server error');
  } else {
    const data = await response.json();
    return data.data;
  }
}


// when clicking the "Close" button, close the connection
async function closeConnectionHandler() {
  if (!sessionInfo_patient) {
    updateStatus('Please create a connection first');
    return;
  }

  renderID++;
  hideElement(canvasElement);
  mediaCanPlay = false;

  updateStatus('Closing connection... please wait');
  try {
    // Close local connection
    peerConnection_patient.close();
    // Call the close interface
    const resp = await stopSession(sessionInfo_patient.session_id);

    console.log(resp);
  } catch (err) {
    console.error('Failed to close the connection:', err);
  }
  updateStatus('Connection closed successfully');
}

// new session
async function newSession(quality, avatar_name, voice_id) {
  const response = await fetch(`${SERVER_URL}/v1/streaming.new`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({
      quality,
      avatar_name,
      voice: {
        voice_id: voice_id,
      },
    }),
  });
  if (response.status === 500) {
    console.error('Server error');
    updateStatus(
      'Server Error. Please ask the staff if the service has been turned on',
    );

    throw new Error('Server error');
  } else {
    console.log('Session started');
    const data = await response.json();
    console.log(data);
    return data.data;
  }
}


// submit the ICE candidate
async function handleICE(session_id, candidate) {
  const response = await fetch(`${SERVER_URL}/v1/streaming.ice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({ session_id, candidate }),
  });
  if (response.status === 500) {
    console.error('Server error');
    updateStatus(
      'Server Error. Please ask the staff if the service has been turned on',
    );
    throw new Error('Server error');
  } else {
    const data = await response.json();
    return data;
  }
}


// repeat the text
async function repeat(session_id, text) {
  const response = await fetch(`${SERVER_URL}/v1/streaming.task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({ session_id, text }),
  });
  if (response.status === 500) {
    console.error('Server error');
    updateStatus(
      'Server Error. Please ask the staff if the service has been turned on',
    );
    throw new Error('Server error');
  } else {
    const data = await response.json();
    return data.data;
  }
}

// stop session
async function stopSession(session_id) {
  const response = await fetch(`${SERVER_URL}/v1/streaming.stop`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({ session_id }),
  });
  if (response.status === 500) {
    console.error('Server error');
    updateStatus('Server Error. Please ask the staff for help');
    throw new Error('Server error');
  } else {
    console.log('Session stopped');
    const data = await response.json();
    return data.data;
  }
}

let renderID_patient = 0;
function renderCanvas_patient() {
  isRendering = true;
  // if (!removeBGCheckbox.checked) return;
  hideElement(mediaElement_patient);
  showElement(canvasElement_patient);

  canvasElement_patient.classList.add('show');

  const curRenderID = Math.trunc(Math.random() * 1000000000);
  renderID_patient = curRenderID;

  const ctx = canvasElement_patient.getContext('2d', { willReadFrequently: true });

  function processFrame() {
    // if (!removeBGCheckbox.checked) return;
    if (curRenderID !== renderID_patient) {
      isRendering = false;
      return;
    };

    canvasElement_patient.width = mediaElement_patient.videoWidth;
    canvasElement_patient.height = mediaElement_patient.videoHeight;

    ctx.drawImage(mediaElement_patient, 0, 0, canvasElement_patient.width, canvasElement_patient.height);
    ctx.getContextAttributes().willReadFrequently = true;
    const imageData = ctx.getImageData(0, 0, canvasElement_patient.width, canvasElement_patient.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const red = data[i];
      const green = data[i + 1];
      const blue = data[i + 2];

      // You can implement your own logic here
      if (isCloseToGreen([red, green, blue])) {
        // if (isCloseToGray([red, green, blue])) {
        data[i + 3] = 0;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    requestAnimationFrame(processFrame);
  }

  processFrame();
}

function isCloseToGreen(color) {
  const [red, green, blue] = color;
  return green > 90 && red < 90 && blue < 90;
}

function hideElement(element) {
  element.classList.add('hide');
  element.classList.remove('show');
}
function showElement(element) {
  element.classList.add('show');
  element.classList.remove('hide');
}

let mediaCanPlay = false;

mediaElement_patient.onloadedmetadata = () => {
  mediaCanPlay = true;
  mediaElement_patient.play();
  renderCanvas_patient();
  // showElement(bgCheckboxWrap);
};
/* 
const textarea = document.querySelector('textarea');

textarea.addEventListener('input', function () {
  this.style.height = 'auto'; // Reset height to recalculate
  this.style.height = Math.min(this.scrollHeight, 128) + 'px'; // 128px max height
}); */
const style = document.createElement('style');
debugger;
style.textContent = `
  /* Hide the Powered by badge */
  #lite-badge, 
  .lite-badge, 
  span[class*="text-center"][class*="text-[13px]"] {
    display: none !important;
  }

  /* Force textarea to auto-resize properly */
  textarea {
    overflow-y: auto !important;
    resize: none !important;
    max-height: 128px !important;
    min-height: 56px !important;
    height: auto !important;
  }
`;
// Try to access the Flowise widget's shadow root
function hidePoweredByInShadow() {
  const chatbot = document.querySelector('flowise-fullchatbot') || document.querySelector('flowise-chatbot');
  if (!chatbot || !chatbot.shadowRoot) return;

  const spans = chatbot.shadowRoot.querySelectorAll('span');
  spans.forEach((span) => {
    if (span.textContent.includes('Powered by')) {
      span.textContent = '';
      clearInterval(interval); // Stop the interval once done
      //span.style.display = 'none';
      console.log('Hiding "Powered by Instancy" span inside shadow DOM');
    }
  });
}

// Run on interval to catch delayed rendering
interval = setInterval(() => {
  hidePoweredByInShadow();
}, 500);
