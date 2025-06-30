//import Chatbot1 from "https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js";
//import Chatbot2 from "https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js";

import Chatbot1 from "https://instancycommoncontent.blob.core.windows.net/flowise-embed/1.2.5.3/dist/web.js";
import Chatbot2 from "https://instancycommoncontent.blob.core.windows.net/flowise-embed/1.2.5.3/dist/web.js";



let messageHistory = [];
const _sessionKey = sessionStorage.getItem("sessionKey");
const userName = sessionStorage.getItem(_sessionKey + "_UNAME");
const rolePlayData = getSessionStorage(_sessionKey);
const rolePlaychatflowID = rolePlayData.RolePlayChatID; // rolePlaychatflowID_agnet;
const rolePlayAPIHost = rolePlayData.RolePlayAPIHost; //rolePlayAPIHost_agnet;
const evaluatorchatflowID = rolePlayData.EvaluatorChatID; //evaluatorchatflowID_agent;
const evaluatorAPIHost = rolePlayData.EvaluatorAPIHost; 
const rolePlayConfigData = JSON.parse(JSON.parse(rolePlayData.RolePlayData));
var concludeText = rolePlayConfigData.ConclusionMessage;// rolePlayConfigData.RolePlayCompletionMessage;
const intro_roleplay =  rolePlayConfigData.SimulatedParticipantOpeningStatement ? rolePlayConfigData.SimulatedParticipantOpeningStatement : "Hello.";
const intro_evaluator =  rolePlayConfigData.EvaluationIntroMessage + " Type 'Start' when you're ready to receive your personalized feedback!"; // "Hi, this is Michael Thompson, the Senior Customer Service Representative. Thanks for completing the Customer Service roleplay! I'll now provide feedback on your communication quality, problem-solving skills, and adherence to customer service best practices. Drawing from my extensive experience in customer service, I'll offer constructive insights on customer-centricity, empathy, and clarity. Your performance will be rated on a 1-5 scale with recommendations for improvement. After my feedback, you can ask me any questions. Type 'Start' when you're ready to receive your personalized feedback!";
const title_chat = rolePlayConfigData.Title; //EvaluationIntroMessage - above
const ScenarioVideoID = rolePlayData.ScenarioVideoID;
const EvaluatorVideoID =  rolePlayData.EvaluatorVideoID;
const ScenarioWebURL = rolePlayData.ScenarioWebURL;
const EvaluatorWebURL = rolePlayData.EvaluatorWebURL; 
const docSessionID = _sessionKey.split("_")[2];
const simulatedName =   rolePlayConfigData.SimulatedParticipantName;
const userAvatarSrc = `https://ui-avatars.com/api/?name=${userName.charAt(0)}&background=random`; 
const simulatedAvatarSrc = `https://ui-avatars.com/api/?name=${rolePlayConfigData.SimulatedParticipantName.charAt(0)}&background=random`; 
const evaluatorAvatarSrc = `https://ui-avatars.com/api/?name=${rolePlayConfigData.GuideName.charAt(0)}&background=random`; 
var roleplaySessionID = "";
var interval = null;
if(sessionStorage.getItem("RoleplaySessionID_" + _sessionKey) != null)
  roleplaySessionID = sessionStorage.getItem("RoleplaySessionID_" + _sessionKey);
else
{
  roleplaySessionID = generateGUID();
  sessionStorage.setItem("RoleplaySessionID_" + _sessionKey,roleplaySessionID);
}
   
if(rolePlayConfigData.WhoWillConclude == 'Learner')
    concludeText = rolePlayConfigData.RolePlayCompletionMessage;
  //chatbotConfig.theme.chatWindow.welcomeMessage = rolePlayConfigData.WelcomeMessage;
  //chatbotConfig2.theme.chatWindow.welcomeMessage = rolePlayConfigData.EvaluationIntroMessage;
  if(sessionStorage.getItem("old_sessionKey") != null){
    if(sessionStorage.getItem("old_sessionKey") != _sessionKey){
      sessionStorage.removeItem("old_sessionKey");
      localStorage.removeItem(rolePlaychatflowID + "_EXTERNAL");
      localStorage.removeItem(evaluatorchatflowID + "_EXTERNAL");
    }
  }

  changeBackground(rolePlayConfigData.BackgroundType, rolePlayConfigData.BackgroundValue?.toString());

 
console.log(rolePlayConfigData);

const mediaElement_avtar = document.querySelector('#mediaElement_avtar');
const canvasElement_avtar = document.querySelector('#canvasElement_avtar');

const mediaElement_patient = document.querySelector('#mediaElement_patient');
const canvasElement_patient = document.querySelector('#canvasElement_patient');


const apiKey = rolePlayData.AvatarValue;
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
if(localStorage.getItem(evaluatorchatflowID + "_EXTERNAL") != null){
  isGuide_on = true;
  if(localStorage.getItem(rolePlaychatflowID + "_EXTERNAL") != null)
    messageHistory = JSON.parse(localStorage.getItem(rolePlaychatflowID + "_EXTERNAL")).chatHistory;
}

//const iconContainer = document.getElementById('iconContainer');
//const chatIcon = document.getElementById('chatIcon');
//const dropdown = document.getElementById('dropdown');
const feedbackContainer = document.getElementById('feedbackContainer');
const buttonRoleplay = document.getElementById('buttonRoleplay');
  const buttonFeedback = document.getElementById('buttonFeedback');

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
function turnOnGuide()
{
if (isGuide_on) {
  buttonRoleplay.classList.remove('selected-icon');
  buttonFeedback.classList.add('selected-icon');
  toggleFlows('feedback');
}
else
{
  buttonRoleplay.classList.add('selected-icon');
  buttonFeedback.classList.remove('selected-icon');
  toggleFlows('roleplay');
} 
}
turnOnGuide();
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


const closeBtn = document.getElementById('closeBtn');
closeBtn.addEventListener('click', function () {
  window.location.href = "index.html";
});
const refreshBtn = document.getElementById('refresBtn');
refreshBtn.addEventListener('click', function () {
  console.log("refreshBtn");
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
  localStorage.removeItem(evaluatorchatflowID + "_EXTERNAL");
  localStorage.removeItem(rolePlaychatflowID + "_EXTERNAL");
  roleplaySessionID = generateGUID(); 
  sessionStorage.setItem("RoleplaySessionID_" + _sessionKey,roleplaySessionID);
  chatbotConfig.chatflowConfig.sessionId = roleplaySessionID;
  if(isGuide_on){
    isGuide_on = false;
  }
  turnOnGuide();
  Chatbot2.initFull(chatbotConfig);
  interval = setInterval(() => {
    hidePoweredByInShadow();
  }, 500);
});

function generateGUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}




function changeBackground(type, value) {
  if (type === 'bgimage') {
      document.documentElement.style.setProperty('--bg-style', `url('${value}')`);
      document.documentElement.style.setProperty('--bg-color', 'transparent'); // Remove color
  } else if (type === 'bgcolor') {
      document.documentElement.style.setProperty('--bg-color', value);
      document.documentElement.style.setProperty('--bg-style', 'none'); // Remove image
  }
  document.getElementById("chatbotTitle").innerHTML =  title_chat ;
}
	
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
  chatflowid: rolePlaychatflowID,
  apiHost: rolePlayAPIHost,
  streaming: false,
  chatflowConfig: {
    sessionId:roleplaySessionID,
    promptValues:  {
      "LearningObjective": rolePlayConfigData.LearningObjective,
      "SimulatedParticipantRoleDescription": rolePlayConfigData.SimulatedParticipantRoleDescription,
      "SimulatedParticipantTone":rolePlayConfigData.SimulatedParticipantTone,
      "LearnerRoleDescription": rolePlayConfigData.LearnerRoleDescription,
      "ScenarioDescription": rolePlayConfigData.ScenarioDescription,
      "NumberOfMessages": rolePlayConfigData.NumberOfMessages,
      "SimulatedParticipantName": rolePlayConfigData.SimulatedParticipantName,
      "RolePlayCompletionMessage": rolePlayConfigData.RolePlayCompletionMessage,
      "upperLimit": rolePlayConfigData.UpperLimit,
      "EndBy": rolePlayConfigData.WhoWillConclude,
      "closingMessage": rolePlayConfigData.ConclusionMessage
      },
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
    chromaMetadataFilter:{"sessionId": docSessionID},
    url: ScenarioWebURL,
    customParameters: {
            "video_id": ScenarioVideoID
        }
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

        if (window.dailyCallManager && lastApiMessage && lastApiMessage.message) {
          window.dailyCallManager.sendMessage(lastApiMessage.message);
        } 

        async function talktoPatient(text) {
          isRendering = true;
          const resp = await repeat(sessionInfo_patient.session_id, text);
          console.log("resp", resp);
          return resp;
        }
        // Change flow based on user input
        if (lastUserMessage.message && lastUserMessage.message.toLowerCase().includes(concludeText.toLowerCase()) || lastApiMessage.message && lastApiMessage.message.toLowerCase().includes(concludeText.toLowerCase())) {
          console.log(concludeText.toLowerCase());
          const chatbotElement = document.getElementById('myChatbot');
          const evaluatorElement = document.getElementById('evaluator');
          is_evaluator = true;
          var resp_patient = { "duration_ms": 100 };
          if (lastApiMessage && sessionInfo_patient) {
            resp_patient = await talktoPatient(lastApiMessage.message);
            renderCanvas_patient();
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
            turnOnGuide();
            //iconContainer.style.display = 'block';
            Chatbot2.initFull(chatbotConfig2);
            updateStatus("please wait while we are loading the guide avatar.");
            interval = setInterval(() => {
              hidePoweredByInShadow();
            }, 500);
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

            // Save it back to localStorage after modification
            localStorage.setItem(evaluatorchatflowID + "_EXTERNAL", JSON.stringify(chatData));

            // Reset lastApiMessage
            lastApiMessage = null;

            // If you need to show a loading overlay
            if (show_patient) {
              showLoadingOverlay("please wait while we are loading the roleplay avatar.");
              await closeConnectionHandler();
              await createNewSession_patient(avatar_evaluator, voice_evealuator);

              const checkSessionInterval = setInterval(async () => {
                if (sessionInfo_patient && is_session_started) {
                  clearInterval(checkSessionInterval); // Clear the interval once session info is available
                  hideLoadingOverlay();
                  await talktoPatient(intro_evaluator);
                }
              }, 5000);
            }
        }, resp_patient.duration_ms??1000);

        }
        else {
          if (lastApiMessage && sessionInfo_patient) {
            talktoPatient(lastApiMessage.message);
            renderCanvas_patient();
          }
          else {
            updateStatus('Please create a avtar connection first');
          }
        }
      }
    },
  },
  theme: {
    chatWindow: {
      showTitle: false,
      title: title_chat,
      titleAvatarSrc: '', //./assets/instancy28.png
      showAgentMessages: false,
      welcomeMessage: intro_roleplay,
      errorMessage: 'Something went wrong. Please try again later.',
      backgroundColor: "rgba(255, 255, 255, 0)",
      height: 1700,
      width: 800,
      fontSize: 16,
      poweredByTextColor: "#037700",
      botMessage: {
        backgroundColor: "#d0e7ff",
        textColor: "#000000",
        showAvatar: true,
        avatarSrc: simulatedAvatarSrc,
      },
      userMessage: {
        backgroundColor: "#f5f5f5",
        textColor: "#000000",
        showAvatar: true,
        avatarSrc: userAvatarSrc,
      },
      textInput: {
        placeholder: 'Write your message...',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        sendButtonColor: '#007bff',
        maxChars: 500,
        autoFocus: true,
        sendMessageSound: true,
        receiveMessageSound: true,
      },
      feedback: {
        color: '#007bff',
      },
      footer: {
        textColor: '#ffffff',
        text: 'Powered by',
        company: 'Instancy',
        companyLink: 'https://www.instancy.com/',
      }
    }
  }
};
console.log("evaluation score",rolePlayConfigData.IsScore.toString());
const chatbotConfig2 = {
  chatflowid: evaluatorchatflowID,
  apiHost: evaluatorAPIHost,
  streaming: false,
  chatflowConfig: {
    sessionId: roleplaySessionID,
    promptValues: {
      "EvaluatorDescription": rolePlayConfigData.GuideDescription,
      "EvaluationCriteriaDescription": rolePlayConfigData.EvaluationCriteriaDescription,
      "EvaluationFeedbackMechanisms": rolePlayConfigData.EvaluationFeedbackMechanisms,
      "Score": rolePlayConfigData.IsScore.toString(),
      "EvaluatorName":rolePlayConfigData.GuideName, 
      "EvaluatorTone":rolePlayConfigData.GuideTone,
      "messages": allMessage,
    },
    chromaMetadataFilter:{"sessionId": docSessionID},
    url: EvaluatorWebURL,
    customParameters: {
            "video_id": EvaluatorVideoID
        }
  },
  observersConfig: {
    observeUserInput: (userInput) => {
      console.log({ "userInput": userInput });
      lastUserMessage = userInput; // Update last user message
    },
    observeMessages: (messages) => {
      const userMessages = messages.filter((message) => message.type === "userMessage");
      const apiMessages = messages.filter((message) => message.type === "apiMessage");

      console.log("allMessage_str", allMessage_str);

      lastUserMessage = userMessages.slice(-1)[0];
      lastApiMessage = apiMessages.slice(-1)[0];
    },
    observeLoading: async (loading) => {
      console.log({ "loading": loading });
      if (!loading) {
        console.log("lastUserMessage", lastUserMessage);
        console.log("lastApiMessage", lastApiMessage);

        async function talktoPatient(text) {
          const resp = await repeat(sessionInfo_patient.session_id, text);
        }

        console.log("lastApiMessage", lastApiMessage, "is_evaluator", is_evaluator, "sessionInfo_avatar", sessionInfo_avatar);
        console.log("lastApiMessage", lastApiMessage, "!is_evaluator", !is_evaluator, "sessionInfo_patient", sessionInfo_patient);

        if (lastApiMessage && sessionInfo_patient) {
          talktoPatient(lastApiMessage.message);
          renderCanvas_patient();
        }
        else {
          updateStatus('Please create a avtar connection first');
        }
      }
    },
  },
  theme: {
    chatWindow: {
      showTitle: false,
      title: title_chat,
      titleAvatarSrc: '', //./assets/instancy28.png
      showAgentMessages: false,
      welcomeMessage: intro_evaluator,
      errorMessage: 'Something went wrong. Please try again later.',
      backgroundColor: "rgba(255, 255, 255, 0)",
      height: 1700,
      width: 800,
      fontSize: 16,
      poweredByTextColor: "#037700",
      botMessage: {
        backgroundColor: "#d0e7ff",
        textColor: "#000000",
        showAvatar: true,
        avatarSrc: evaluatorAvatarSrc,
      },
      userMessage: {
        backgroundColor: "#f5f5f5",
        textColor: "#000000",
        showAvatar: true,
        avatarSrc: userAvatarSrc,
      },
      textInput: {
        placeholder: 'Write your message...',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        sendButtonColor: '#007bff',
        maxChars: 200,
        autoFocus: true,
        sendMessageSound: true,
        receiveMessageSound: true,
      },
      feedback: {
        color: '#007bff',
      },
      footer: {
        textColor: '#ffffff',
        text: 'Powered by',
        company: 'Instancy',
        companyLink: 'https://www.instancy.com/',
      }
    }
  }
};

async function talktoPatient(text) {
  const resp = await repeat(sessionInfo_patient.session_id, text);
}


async function initialization() {
  //alert(rolePlayConfigData.SimulatedParticipantRoleDescription);
  if(isGuide_on){
    Chatbot2.initFull(chatbotConfig2);
  }
  else
  {
    Chatbot2.initFull(chatbotConfig);
  }

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

class DailyCallManager {
  debugger;
  constructor() {
    debugger;
    this.call = Daily.createCallObject();
    this.currentRoomUrl = null;
	  this.conversationId = '';
    this.initialize();
  }

  getConversationId() {
    return this.conversationId;
  } 

  /**
   * Performs initial setup of event listeners and UI component interactions.
   */
  async initialize() {
    this.setupEventListeners();   
  }

  /**
   * Configures event listeners for various call-related events.
   */
  setupEventListeners() {
    const events = {      
      error: this.handleError.bind(this),
      //'joined-meeting': this.handleJoin.bind(this),
     // 'left-meeting': this.handleLeave.bind(this),
      'participant-joined': this.handleParticipantJoinedOrUpdated.bind(this),
      'participant-left': this.handleParticipantLeft.bind(this),
      'participant-updated': this.handleParticipantJoinedOrUpdated.bind(this),
    }; 
    Object.entries(events).forEach(([event, handler]) => {
      this.call.on(event, handler);
    });
  }

  /**
   * Handler for the local participant joining:
   * - Prints the room URL
   * - Enables the toggle camera, toggle mic, and leave buttons
   * - Gets the initial track states
   * - Sets up and enables the device selectors
   * @param {Object} event - The joined-meeting event object.
   */
  handleJoin(event) {
    const tracks = event.participants.local.tracks;
    console.log(`Successfully joined: ${this.currentRoomUrl}`);
    
    this.setupDeviceSelectors();

    // Initialize the camera and microphone states and UI for the local
    // participant
    /*Object.entries(tracks).forEach(([trackType, trackInfo]) => {
      this.updateUiForDevicesState(trackType, trackInfo);
    });*/
  }

  /**
   * Handler for participant leave events:
   * - Confirms leaving with a console message
   * - Disable the toggle camera and mic buttons
   * - Resets the camera and mic selectors
   * - Updates the call state in the UI
   * - Removes all video containers
   */
  handleLeave() {
    console.log('Successfully left the call'); 
    // Remove all video containers
    const videosDiv = document.getElementById('videos');
    while (videosDiv.firstChild) {
      videosDiv.removeChild(videosDiv.firstChild);
    }
  }

  /**
   * Handles fatal errors emitted from the Daily call object.
   * These errors result in the participant leaving the meeting. A
   * `left-meeting` event will also be sent, so we still rely on that event
   * for cleanup.
   * @param {Object} e - The error event object.
   */
  handleError(e) {
    console.error('DAILY SENT AN ERROR!', e.error ? e.error : e.errorMsg);
  }

  /**
   * Handles participant-left event:
   * - Cleans up the video and audio tracks for the participant
   * - Removes the related UI elements
   * @param {Object} event - The participant-left event object.
   */
  handleParticipantLeft(event) {
    const participantId = event.participant.session_id;

    // Clean up the video and audio tracks for the participant
    this.destroyTracks(['video', 'audio'], participantId);

    // Now, remove the related video UI
    document.getElementById(`video-container-${participantId}`)?.remove();    
    
  }

  /**
   * Handles participant-joined and participant-updated events:
   * - Updates the participant count
   * - Creates a video container for new participants
   * - Creates an audio element for new participants
   * - Manages video and audio tracks based on their current state
   * - Updates device states for the local participant
   * @param {Object} event - The participant-joined, participant-updated
   * event object.
   */
   handleParticipantJoinedOrUpdated(event) {
	const { participant } = event;
    const participantId = participant.session_id;
    const isLocal = participant.local;
    const tracks = participant.tracks;   
   if(!participant.local)
	{
		
    // Always update the participant count regardless of the event action
    //this.updateAndDisplayParticipantCount();

    // Create a video container if one doesn't exist
    if (!document.getElementById(`video-container-${participantId}`)) {
      this.createVideoContainer(participantId);
    }

    // Create an audio element for non-local participants if one doesn't exist
    if (!document.getElementById(`audio-${participantId}`) && !isLocal) {
      this.createAudioElement(participantId);
    }

    Object.entries(tracks).forEach(([trackType, trackInfo]) => {
      // If a persistentTrack exists...
      if (trackInfo.persistentTrack) {
        // Check if this is the local participant's audio track.
        // If so, we will skip playing it, as it's already being played.
        // We'll start or update tracks in all other cases.
        if (!(isLocal && trackType === 'audio')) {
          this.startOrUpdateTrack(trackType, trackInfo, participantId);
        }
      } else {
        // If the track is not available, remove the media element
        this.destroyTracks([trackType], participantId);
      }

      // Update the video UI based on the track's state
      if (trackType === 'video') {
        this.updateVideoUi(trackInfo, participantId);
      } 
       
    });	
   }
   //initialization();
   //  call Rople Start Button 
  } 
  

  /**
   * Tries to join a call with provided room URL and optional join token.
   * @param {string} roomUrl - The URL of the room to join.
   * @param {string|null} joinToken - An optional token for joining the room.
   */
  async joinRoom(roomUrl, joinToken = null) {
    if (!roomUrl) {
      console.error('Room URL is required to join a room.');
      return;
    }

    this.currentRoomUrl = roomUrl;

    const joinOptions = { url: roomUrl };
    if (joinToken) {
      joinOptions.token = joinToken;
      console.log('Joining with a token.');
    } else {
      console.log('Joining without a token.');
    }

    try {       
      await this.call.join(joinOptions);
    } catch (e) {
      console.error('Join failed:', e);
    }
  }

  /**
   * Creates and sets up a new video container for a specific participant. This
   * function dynamically generates a video element along with a container and
   * an overlay displaying the participant's ID. The newly created elements are
   * appended to a designated parent in the DOM, preparing them for video
   * streaming or playback related to the specified participant.
   *
   * @param {string} participantId - The unique identifier for the participant.
   */
  createVideoContainer(participantId) {
    // Create a video container for the participant
    const videoContainer = document.createElement('div');
    videoContainer.id = `video-container-${participantId}`;
    videoContainer.className = 'video-container';
    document.getElementById('videos').appendChild(videoContainer);

    // Add an overlay to display the participant's session ID
    /*const sessionIdOverlay = document.createElement('div');
    sessionIdOverlay.className = 'session-id-overlay';
    sessionIdOverlay.textContent = participantId;
    videoContainer.appendChild(sessionIdOverlay);*/
	
    // Create a video element for the participant
    const videoEl = document.createElement('video');
    videoEl.className = 'video-element';
    videoContainer.appendChild(videoEl);
  }

  /**
   * Creates an audio element for a particular participant. This function is
   * responsible for dynamically generating a standalone audio element that can
   * be used to play audio streams associated with the specified participant.
   * The audio element is appended directly to the document body or a relevant
   * container, thereby preparing it for playback of the participant's audio.
   *
   * @param {string} participantId - A unique identifier corresponding to the participant.
   */
  createAudioElement(participantId) {
    // Create an audio element for the participant
    const audioEl = document.createElement('audio');
    audioEl.id = `audio-${participantId}`;
    document.body.appendChild(audioEl);
  }

  /**
   * Updates the media track (audio or video) source for a specific participant
   * and plays the updated track. It checks if the source track needs to be
   * updated and performs the update if necessary, ensuring playback of the
   * media track.
   *
   * @param {string} trackType - Specifies the type of track to update ('audio'
   * or 'video'), allowing the function to dynamically adapt to the track being
   * processed.
   * @param {Object} track - Contains the media track data, including the
   * `persistentTrack` property which holds the actual MediaStreamTrack to be
   * played or updated.
   * @param {string} participantId - Identifies the participant whose media
   * track is being updated.
   */
  startOrUpdateTrack(trackType, track, participantId) {
    // Construct the selector string or ID based on the trackType.
    const selector =
      trackType === 'video'
        ? `#video-container-${participantId} video.video-element`
        : `audio-${participantId}`;

    // Retrieve the specific media element from the DOM.
    const trackEl =
      trackType === 'video'
        ? document.querySelector(selector)
        : document.getElementById(selector);

    // Error handling if the target media element does not exist.
    if (!trackEl) {
      console.error(
        `${trackType} element does not exist for participant: ${participantId}`
      );
      return;
    }

    // Check for the need to update the media source. This is determined by
    // checking whether the existing srcObject's tracks include the new
    // persistentTrack. If there are no existing tracks or the new track is not
    // among them, an update is necessary.
    const existingTracks = trackEl.srcObject?.getTracks();
    const needsUpdate = !existingTracks?.includes(track.persistentTrack);

    // Perform the media source update if needed by setting the srcObject of
    // the target element to a new MediaStream containing the provided
    // persistentTrack.
    if (needsUpdate) {
      trackEl.srcObject = new MediaStream([track.persistentTrack]);

      // Once the media metadata is loaded, attempts to play the track. Error
      // handling for play failures is included to catch and log issues such as
      // autoplay policies blocking playback.
      trackEl.onloadedmetadata = () => {
        trackEl
          .play()
          .catch((e) =>
            console.error(
              `Error playing ${trackType} for participant ${participantId}:`,
              e
            )
          );
      };
    }
  }

  /**
   * Shows or hides the video element for a participant, including managing
   * the visibility of the video based on the track state.
   * @param {Object} track - The video track object.
   * @param {string} participantId - The ID of the participant.
   */
  updateVideoUi(track, participantId) {
    let videoEl = document
      .getElementById(`video-container-${participantId}`)
      .querySelector('video.video-element');

    switch (track.state) {
      case 'off':
      case 'interrupted':
      case 'blocked':
        videoEl.style.display = 'none'; // Hide video but keep container
        break;
      case 'playable':
      default:
        // Here we handle all other states the same as we handle 'playable'.
        // In your code, you may choose to handle them differently.
        videoEl.style.display = '';
        break;
    }
  }

  /**
   * Cleans up specified media track types (e.g., 'video', 'audio') for a given
   * participant by stopping the tracks and removing their corresponding
   * elements from the DOM. This is essential for properly managing resources
   * when participants leave or change their track states.
   * @param {Array} trackTypes - An array of track types to destroy, e.g.,
   * ['video', 'audio'].
   * @param {string} participantId - The ID of the participant.
   */
  destroyTracks(trackTypes, participantId) {
    trackTypes.forEach((trackType) => {
      const elementId = `${trackType}-${participantId}`;
      const element = document.getElementById(elementId);
      if (element) {
        element.srcObject = null; // Release media resources
        element.parentNode.removeChild(element); // Remove element from the DOM
      }
    });
  }

  /**
   * Toggles the local video track's mute state.
   */
  toggleCamera() {
    this.call.setLocalVideo(!this.call.localVideo());
  }

  /**
   * Toggles the local audio track's mute state.
   */
  toggleMicrophone() {
    this.call.setLocalAudio(!this.call.localAudio());
  }

  /**
   * Updates the UI to reflect the current states of the local participant's
   * camera and microphone.
   * @param {string} trackType - The type of track, either 'video' for cameras
   * or 'audio' for microphones.
   * @param {Object} trackInfo - The track object.
   */
  updateUiForDevicesState(trackType, trackInfo) {
    // For video, set the camera state
    if (trackType === 'video') {
      document.getElementById('camera-state').textContent = `Camera: ${
        this.call.localVideo() ? 'On' : 'Off'
      }`;
    } else if (trackType === 'audio') {
      // For audio, set the mic state
      document.getElementById('mic-state').textContent = `Mic: ${
        this.call.localAudio() ? 'On' : 'Off'
      }`;
    }
  }

  /**
   * Sets up device selectors for cameras and microphones by dynamically
   * populating them with available devices and attaching event listeners to
   * handle device selection changes.
   */
  async setupDeviceSelectors() {
    // Fetch current input devices settings and an array of available devices.
    const selectedDevices = await this.call.getInputDevices();
    const { devices: allDevices } = await this.call.enumerateDevices();

    // Element references for camera and microphone selectors.
    const selectors = {
      videoinput: document.getElementById('camera-selector'),
      audioinput: document.getElementById('mic-selector'),
    };

    // Prepare selectors by clearing existing options and adding a
    // non-selectable prompt.
    Object.values(selectors).forEach((selector) => {
      selector.innerHTML = '';
      const promptOption = new Option(
        `Select a ${selector.id.includes('camera') ? 'camera' : 'microphone'}`,
        '',
        true,
        true
      );
      promptOption.disabled = true;
      selector.appendChild(promptOption);
    });

    // Create and append options to the selectors based on available devices.
    allDevices.forEach((device) => {
      if (device.label && selectors[device.kind]) {
        const isSelected =
          selectedDevices[device.kind === 'videoinput' ? 'camera' : 'mic']
            .deviceId === device.deviceId;
        const option = new Option(
          device.label,
          device.deviceId,
          isSelected,
          isSelected
        );
        selectors[device.kind].appendChild(option);
      }
    });

    // Listen for user device change requests.
    Object.entries(selectors).forEach(([deviceKind, selector]) => {
      selector.addEventListener('change', async (e) => {
        const deviceId = e.target.value;
        const deviceOptions = {
          [deviceKind === 'videoinput' ? 'videoDeviceId' : 'audioDeviceId']:
            deviceId,
        };
        await this.call.setInputDevicesAsync(deviceOptions);
      });
    });
  }

  /**
   * Updates the UI with the current number of participants.
   * This method combines getting the participant count and updating the UI.
   */
  updateAndDisplayParticipantCount() {
    const participantCount =
      this.call.participantCounts().present +
      this.call.participantCounts().hidden;
    document.getElementById(
      'participant-count'
    ).textContent = `Participants: ${participantCount}`;
  }

  /**
   * Leaves the call and performs necessary cleanup operations like removing
   * video elements.
   */
  async leave() {
    try {
      await this.call.leave();
      document.querySelectorAll('#videos video, audio').forEach((el) => {
        el.srcObject = null; // Release media resources
        el.remove(); // Remove the element from the DOM
      });
    } catch (e) {
      console.error('Leaving failed', e);
    }
  }
  
  sendMessage(message) {
            //const input = document.getElementById('messageInput');
            //const message = input.value.trim();
            
            if (message && this.call) {
                // Send the message to the avatar using Text Respond interaction
                const interaction = {
                    "message_type": "conversation",
                    "event_type": "conversation.echo", 
                    "conversation_id": window.dailyCallManager.conversationId,
                    "properties": {
                        "text": message
                    }
                };
                
                this.call.sendAppMessage(interaction, '*');
                input.value = '';
            }
	}
}
window.DailyCallManager = DailyCallManager;
