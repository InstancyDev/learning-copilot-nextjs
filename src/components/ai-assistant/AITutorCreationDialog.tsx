import React, { useState, useEffect } from 'react';
import { generateTopicsWithAI, createContentItemAndAIAgent, getSiteConfigValue, initiateBackgroundProcess, callFixedAITutorPredictionAPI, generateAITopicNodesAPI, generateAITopicNodeImageAPI, saveBase64ToFileAPI, saveTopicListAPI, generateThumbnailWithAI } from '@/services/api.service';
import { sessionUtils } from '@/utils/auth';
import { Bot, Youtube, Search, Globe, FileText, X, Upload, Cpu } from 'lucide-react';
import { API_CONFIG } from '@/config/api.config';

interface AITutorCreationDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (data: any) => void;
}

const initialState = {
  title: '',
  description: '',
  learningObjective: '',
  icon: '',
  instructions: '',
  welcomeMessage: '',
  audience: '',
  tone: '',
  thumbnail: null as File | null,
  thumbnailName: '',
  thumbnailBase64: '',
};

const AITutorCreationDialog: React.FC<AITutorCreationDialogProps> = ({ open, onClose, onGenerate }) => {
  const [form, setForm] = useState(initialState);
  const [step, setStep] = useState(1);
  const [numTopics, setNumTopics] = useState(5);
  const [textChatMessage, setTextChatMessage] = useState(true);
  const [numWords, setNumWords] = useState(30);
  const [image, setImage] = useState(true);
  const [imageSize, setImageSize] = useState('1024x1024');
  const [imageStyle, setImageStyle] = useState('Flat Design');
  const [quizQuestion, setQuizQuestion] = useState(true);
  const [quizQuestionCount, setQuizQuestionCount] = useState('3');
  const [questionBranch, setQuestionBranch] = useState(true);
  const [selectedDataSource, setSelectedDataSource] = useState<string | null>(null);
  const [generatedTopics, setGeneratedTopics] = useState<any[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTopicIdx, setEditTopicIdx] = useState<number | null>(null);
  const [editTopicName, setEditTopicName] = useState('');
  const [editTriggerInput, setEditTriggerInput] = useState('');
  const [editTriggers, setEditTriggers] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTopicIdx, setDeleteTopicIdx] = useState<number | null>(null);
  const [bgLoading, setBgLoading] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topicNodesLoading, setTopicNodesLoading] = useState(false);
  const [topicNodesResult, setTopicNodesResult] = useState<any>(null);
  const [topicNodesError, setTopicNodesError] = useState<string | null>(null);
  const [topicNodeImagesLoading, setTopicNodeImagesLoading] = useState(false);
  const [topicNodeResult, setTopicNodeResult] = useState<any>(null);
  const [isThumbnailModalOpen, setIsThumbnailModalOpen] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [isGenerateAIModalOpen, setIsGenerateAIModalOpen] = useState(false);
  const [aiImageDescription, setAIImageDescription] = useState('');
  const [aiImageType, setAIImageType] = useState('');
  const [isGeneratingAIImage, setIsGeneratingAIImage] = useState(false);
  const [aiImageError, setAIImageError] = useState<string | null>(null);
  const [aiGeneratedImage, setAIGeneratedImage] = useState<string>('');

  const dataSources = [
    {
      key: "llm",
      icon: <Bot className="w-5 h-5" />,
      title: "Large Language Model (LLM)",
      description: "Generate content using AI",
      color: 'text-purple-600'
    },
    {
      key: "youtube_search",
      icon: <Youtube className="w-5 h-5" />,
      title: "YouTube Search",
      description: "Search and import from YouTube",
      color: 'text-red-500'
    },
    {
      key: "internet_search",
      icon: <Search className="w-5 h-5" />,
      title: "Internet Search",
      description: "Search and import from the web",
      color: 'text-blue-500'
    },
    {
      key: "youtube",
      icon:  <Youtube className="w-5 h-5" />,
      title: "YouTube",
      description: "Import from a YouTube URL",
      color: 'text-red-600'
    },
    {
      key: "website",
      icon: <Globe className="w-5 h-5" />,
      title: "Website",
      description: "Import from a website URL",
      color: 'text-green-600'
    },
    {
      key: "document",
      icon: <FileText className="w-5 h-5" />,
      title: "Document",
      description: "Import from a document",
      color: 'text-blue-600'
    },
  ];

  const aiImageTypes = [
    'Flat design',
    'Iconic/Symbolic',
    'Modern Abstract',
    'Photorealistic',
    'Infographic',
    '3D Infographic',
    'Hand-drawn/Sketch',
  ];

  useEffect(() => {
    if (open) {
      setForm(initialState);
      setStep(1);
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleThumbnailButtonClick = () => {
    setIsThumbnailModalOpen(true);
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
        setForm(prev => ({
          ...prev,
          thumbnail: file,
          thumbnailName: file.name,
          thumbnailBase64: reader.result as string,
        }));
        setIsThumbnailModalOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
    setForm(prev => ({ ...prev, thumbnail: null, thumbnailName: '', thumbnailBase64: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2); 
  };

  const handleNextStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle submission for step 2
  };

  const handleNextStep = () => {
    setStep(3);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handleGenerateWithAI = () => {
    setStep(2);
  };

  const handleGenerateWithAIClick = () => {
    setIsThumbnailModalOpen(false);
    setIsGenerateAIModalOpen(true);
  };

  const handleDataSourceNext = () => {
    // Final submit or next logic here
    // onGenerate or onClose can be called here if needed
  };

  const handleGenerateTopics = async () => {
    setTopicsLoading(true);
    try {
      const data = await generateTopicsWithAI({
        learning_objective: form.learningObjective || "Ai Tutor Sample",
        title: form.title || "Ai Tutor Sample",
        numberofTopics: numTopics?.toString() || "2",
        audience: form.audience || "",
        tone: form.tone || "",
        description: form.description || "Ai Tutor Sample"
      });
      if (data && data.json) {
        setGeneratedTopics(data.json);
        setStep(4);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setTopicsLoading(false);
  };

  const openEditModal = (idx: number) => {
    debugger;
    setEditTopicIdx(idx);
    setEditTopicName(generatedTopics[idx].topicName);
    setEditTriggers(Array.isArray(generatedTopics[idx].triggers) ? generatedTopics[idx].triggers : []);
    setEditTriggerInput('');
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditTopicIdx(null);
    setEditTopicName('');
    setEditTriggerInput('');
    setEditTriggers([]);
  };

  const handleAddTrigger = () => {
    if (editTriggerInput.trim() && !editTriggers.includes(editTriggerInput.trim())) {
      setEditTriggers([...editTriggers, editTriggerInput.trim()]);
      setEditTriggerInput('');
    }
  };

  const handleRemoveTrigger = (trigger: string) => {
    setEditTriggers(editTriggers.filter(t => t !== trigger));
  };

  const handleSaveEditTopic = () => {
    if (!editTopicName.trim()) return;
    if (editTopicIdx !== null) {
      setGeneratedTopics(prev => {
        const updated = [...prev];
        const topic = updated[editTopicIdx];
        topic.topicName = editTopicName.trim();
        topic.triggers = [...editTriggers];
        return updated;
      });
    }
    closeEditModal();
  };

  const openDeleteConfirm = (idx: number) => {
    setDeleteTopicIdx(idx);
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setDeleteTopicIdx(null);
  };

  const handleDeleteTopic = () => {
    if (deleteTopicIdx !== null) {
      setGeneratedTopics(prev => prev.filter((_, i) => i !== deleteTopicIdx));
    }
    closeDeleteConfirm();
  };
  const createAITutor = async () => {
    const user = sessionUtils.getUserFromSession();
      if (!user) throw new Error('User not authenticated');
      const FolderID = Number(getSiteConfigValue('CoCreateKnowledgeDefaultFolderID')) || 1403;
      const CMSGroupID = Number(getSiteConfigValue('CoCreateKnowledgeDefaultCMSGroupID')) || 80;
      const ObjectTypeID = 697; // Role Play
      const MediaTypeID = 0; // Roleplay Media Type
      const CategoryType = '';
      const ActionType = 'create';
      const isContentShared = 'false';
      const Categories = '';
      const UnAssignCategories = '';
      // Prepare payloads 
      const additionalData = { 
        botId: '',
        sessionID: user.SessionID || '',
        promptMessage: form.instructions,
        welcomeMessage: form.welcomeMessage,
        learningObjective: form.learningObjective,
        selectedDataSourceName: '',
        dataSourceWebUrl: '',
        youtubeURL: '',
        sourceFileName: '',
        iconSourceFileName: '',
        canSuggestReplies: '',
        aiTutorTone: '',
        audienceText: '',
        numberOfTopics: numTopics,
        numberOfWords: numWords,
        selectedImageResolution: imageSize,
        selectedImageStyle: imageStyle,
        selectedNumberOfQuestions: quizQuestionCount,
        selectedQuestionBranch: questionBranch,
        isQuizQuestionEnabled: quizQuestion,
        isTextEnabled: true,
        isImageEnabled: true,
        coCreateDataSourceModel: '',
        topics: generatedTopics,
      };
      const contentFormData = {
        Language: 'en-us',
        StartPage: '',
        Name: form.title,
        TagName: '',
        VideoIntroduction: '',
        ShortDescription: form.description,
        LongDescription: '',
        LearningObjectives: '',
        TableofContent: '',
        Keywords: '',
        NoofModules: '',
        GroupCodeID: '',
        ContentCode: '',
        MediaTypeID: 0,
        EventStartDateTime: '',
        EventEndDateTime: '',
        RegistrationURL: '',
        Location: '',
        Duration: 0,
        TotalAttempts: 0,
        EnrollmentLimit: 0,
        Bit3: false,
      };
      const contentPayload = {
        Language: 'en-us',
        authorName: user?.UserDisplayName || 'Unknown',
        additionalData: JSON.stringify(additionalData),
        FolderID,
        CMSGroupID,
        ActionType,
        CategoryType,
        ObjectTypeID,
        UserID: user?.UserID || '',
        SiteID: user?.SiteID || '',
        MediaTypeID,
        isContentShared,
        formData: JSON.stringify(contentFormData),
        Categories, 
        ContentID: '',
        topic: '',
        size: '',                
        kbId: '',                
        JWVideoDetails: '',
        JWfileName: '',
        fileName: '',
        ThumbnailImageName: form.thumbnailName || '',
        ThumbnailImage: form.thumbnailBase64 || '',
        UnAssignCategories,
      }
      const aiAgentPayload = {
        action: "create",
        cmsGroupId: CMSGroupID,
        contentId: "",
        folderId: FolderID,
        shortDescription: form.description,
        title: form.title,
      }; 
      return { contentPayload, aiAgentPayload };
  }
  const handleGenerateAITutor = async () => {
    setBgLoading(true);
    //setTopicNodesLoading(false);
    setTopicNodesResult(null);
    setTopicNodesError(null);
    try {
      const user = sessionUtils.getUserFromSession();
      if (!user) throw new Error('User not authenticated');
      const { contentPayload, aiAgentPayload } = await createAITutor();
      const { contentResp, aiAgentResp } = await createContentItemAndAIAgent({ contentPayload, aiAgentPayload });

      for (const topic of generatedTopics) {
        // Build the learning_nodes array based on selected options
        const learningNodesArr = [];
        if (questionBranch) learningNodesArr.push('question branch');
        if (quizQuestion) learningNodesArr.push('quiz question');
        const learningNodesStr = `[${learningNodesArr.join(', ')}]`;
        // Build the payload for the prediction API for this topic
        const payload = {
          question: "generate",
          overrideConfig: {
            vars: {
              clientUrl: API_CONFIG.LearnerURL,
              AllowWindowsandMobileApps: "allow",
              siteId: user.SiteID,
              Locale: user.Language || "en-us",
              userId: user.UserID,
              authorizationCode: user.JwtToken,
              webAPIURL: API_CONFIG.WebAPIURL,
              Language: user.Language || "en-us",
              categoryId: "0",
              emailId: user.EmailAddress || "",
              orgUnitId: user.OrgUnitID
            },
            promptValues: {
              audience: form.audience || "",
              tone: form.tone || "",
              topicName: topic.topicName || "",
              details: topic.details || "",
              numberOfQuestions: quizQuestionCount || "3",
              questionType: "[MC,TF,SC]",
              wordsPerMessage: numWords || "30",
              learning_nodes: learningNodesStr,
              triggerPoints: Array.isArray(topic.triggers) ? topic.triggers : []
            }
          }
        };

        // Call the prediction API
        const prediction = await callFixedAITutorPredictionAPI(payload);

        // Call the topic nodes API if prediction.json exists
        if (prediction && prediction.json) {
          //setTopicNodesLoading(true);
          try {
            const topicNodes = await generateAITopicNodesAPI({
              json: prediction.json,
              imageEnabled: image
            });
            setTopicNodesResult(topicNodes);

            // --- Generate images for each topic node sequentially ---
            if (topicNodes && Array.isArray(topicNodes.images) && image) {
              setTopicNodeImagesLoading(true);
              try {
                for (const img of topicNodes.images) {
                  const prompt = img.imagePrompt || '';
                  if (!prompt) continue;
                  try {
                    const imgResp = await generateAITopicNodeImageAPI({
                      question: prompt,
                      size: imageSize,
                      style: imageStyle,
                    });
                    if (imgResp && imgResp.imageUrl) {
                      const base64String = imgResp.imageUrl.replace('data:image/png;base64,', '');
                      console.log('Before saveBase64ToFileAPI', { base64StringLength: base64String.length, imgId: img.id });
                      try {
                        const generatedImageURL = await saveBase64ToFileAPI({ base64String });
                        console.log('After saveBase64ToFileAPI', { generatedImageURL, imgId: img.id });
                        for (const element of topicNodes.nodes) {
                          if (element.id === img.id) {
                            if (element.data?.messageData) {
                              element.data.messageData = element.data.messageData.replaceAll("<!--imagetag-->", generatedImageURL);
                            }
                            if (element.value) {
                              element.value = element.value.replaceAll("<!--imagetag-->", generatedImageURL);
                            }
                          }
                        }
                      } catch (saveErr: any) {
                        console.error('Error in saveBase64ToFileAPI', { error: saveErr, imgId: img.id, base64StringLength: base64String.length });
                        // Optionally handle save error
                      }
                    }
                  } catch (err: any) {
                    // Optionally handle image generation error
                  }
                }
              } finally {
                setTopicNodeImagesLoading(false);
              }
            }

            // --- Save topic list after images are processed ---
            try {
              await saveTopicListAPI({
                flowId: aiAgentResp.toLowerCase() || '',
                topicName: topic.topicName || '',
                topicDescription: topic.details || '',
                topicType: 'User',
                triggerPhrases: JSON.stringify(topic.triggers || []),
                status: 1,
                nodes: JSON.stringify(topicNodes.nodes || []),
                edges: JSON.stringify(topicNodes.edges || []),
                user
              });
            } catch (saveTopicErr: any) {
              console.error('Error saving topic list:', saveTopicErr);
            }
          } catch (err: any) {
            setTopicNodesError(err?.message || 'Topic Nodes API error');
          }
          //setTopicNodesLoading(false);
        }
      }
    } catch (e: any) {
      // setPredictionError(e?.message || 'Prediction API error');
    }
    setBgLoading(false);
    onClose();
    onGenerate({ refreshed: true });
  };

  const handleGenerateInBackground = async () => {
    setBgLoading(true);
    const FolderID = Number(getSiteConfigValue('CoCreateKnowledgeDefaultFolderID')) || 1403;
    const CMSGroupID = Number(getSiteConfigValue('CoCreateKnowledgeDefaultCMSGroupID')) || 80;
    const ObjectTypeID = 697; // Role Play
    const MediaTypeID = 0; // Roleplay Media Type
    try {
      const user = sessionUtils.getUserFromSession();
      if (!user) throw new Error('User not authenticated');
      const { contentPayload, aiAgentPayload } = await createAITutor();
      const { contentResp, aiAgentResp } = await createContentItemAndAIAgent({ contentPayload, aiAgentPayload });
      // --- Initiate Background Process ---
      const contentID = aiAgentResp?.contentId || contentResp?.contentId || '';
      if (contentID) {
        
        const folderPath = contentID.toLowerCase();
        const createdBy = user.UserID;
        const totalPages = generatedTopics.length;
        const AdditionalData = {
          chatflowID: contentID,
          topicList: generatedTopics,
          enabledNodes: '[question branch, quiz question]',
          noofQuestions: quizQuestionCount,
          wordsPerPage: numWords,
          imageEnabled: true,
          resolution: imageSize,
          imageType: imageStyle,
          dataSource: 'Large Language Model (LLM)',
          dataSourceValue: '',
        };
        await initiateBackgroundProcess({
          contentID,
          folderPath,
          createdBy,
          totalPages,
          AdditionalData,
          siteID: user.SiteID,
          folderID: FolderID,
          CMSGroupID,
          locale: 'en-us',
          objectTypeID: ObjectTypeID,
          mediaTypeID: 84, // as per your curl
          jwtToken: user.JwtToken,
        });
        // After success, close modal and refresh list
        onClose();
        onGenerate({ refreshed: true });
      }
      // Optionally show a success message or move to next step
    } catch (e) {
      // Optionally show error
    }
    setBgLoading(false);
  };

  const handleGenerateAIImage = async () => {
    setIsGeneratingAIImage(true);
    setAIImageError(null);
    try {
      const resp = await generateThumbnailWithAI({
        content: aiImageDescription,
        style: aiImageType,
      });
      // Only use image_base64 for the thumbnail
      let img = resp.image_base64 || '';
      if (img) {
        if (!img.startsWith('data:')) {
          img = `data:image/png;base64,${img}`;
        }
        setAIGeneratedImage(img);
      } else {
        setAIImageError('Failed to generate image.');
      }
    } catch (err: any) {
      setAIImageError(err?.message || 'Failed to generate image.');
    } finally {
      setIsGeneratingAIImage(false);
    }
  };

  const handleAIModalNext = () => {
    setThumbnailPreview(aiGeneratedImage);
    setForm(prev => ({
      ...prev,
      thumbnail: null,
      thumbnailName: '',
      thumbnailBase64: aiGeneratedImage,
    }));
    setIsGenerateAIModalOpen(false);
    setAIImageDescription('');
    setAIImageType('');
    setAIGeneratedImage('');
  };

  const handleAIModalRegenerate = () => {
    handleGenerateAIImage();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-opacity-60 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-8 relative">
        {/* Loader overlay for dialog only */}
        {bgLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white bg-opacity-80">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <div className="text-blue-600 text-base font-semibold">Generating, please wait...</div>
            </div>
          </div>
        )}
        <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl -mt-8 -mx-8 mb-4">
          <h2 className="text-lg font-semibold">Create AI Tutor</h2>
          <button onClick={onClose} className="p-1 text-white hover:text-gray-300 transition-colors">
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        <form className="p-6 space-y-4 h-[70vh] overflow-y-auto">
          {/* Step 1: Initial fields */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Learning Objective *</label>
                <input
                  type="text"
                  name="learningObjective"
                  value={form.learningObjective}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Icon</label>
                <input
                  type="text"
                  name="icon"
                  value={form.icon}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Instructions / Prompt *</label>
                <textarea
                  name="instructions"
                  value={form.instructions}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Welcome Message *</label>
                <textarea
                  name="welcomeMessage"
                  value={form.welcomeMessage}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Audience</label>
                <input
                  type="text"
                  name="audience"
                  value={form.audience}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tone</label>
                <input
                  type="text"
                  name="tone"
                  value={form.tone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Thumbnail Image</label>
                <button
                  type="button"
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                  onClick={handleThumbnailButtonClick}
                >
                  <Upload className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-600">Add Thumbnail Image</span>
                </button>
                {thumbnailPreview && (
                  <div className="mt-2 relative inline-block">
                    <img src={thumbnailPreview} alt="Thumbnail Preview" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8 }} />
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="absolute top-0 right-0 bg-white bg-opacity-80 rounded-full p-1 text-gray-600 hover:text-red-600"
                      title="Remove Image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="pt-4">
                <button
                  type="button"
                  className="w-full bg-blue-600 text-white py-2 rounded mt-6"
                  onClick={handleGenerateWithAI}
                >
                  Generate with AI
                </button>
              </div>
            </>
          )}
          {/* Step 2: AI Options */}
          {step === 2 && (
            <>
              {/* Number of Topics */}
              <div className="mb-4">
                <label className="block mb-1 font-medium">Number of Topics</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={numTopics}
                  min={1}
                  onChange={e => setNumTopics(Number(e.target.value))}
                />
              </div>
              {/* Text Chat Message Switch */}
              <div className="mb-4 flex items-center">
                <label className="block font-medium mr-4">Text Chat Message</label>
                <input
                  type="checkbox"
                  checked={textChatMessage}
                  onChange={e => setTextChatMessage(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </div>
              {/* Number of Words */}
              <div className="mb-4">
                <label className="block mb-1 font-medium">Number of Words</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={numWords}
                  min={1}
                  onChange={e => setNumWords(Number(e.target.value))}
                />
              </div>
              {/* Image Switch */}
              <div className="mb-4 flex items-center">
                <label className="block font-medium mr-4">Image</label>
                <input
                  type="checkbox"
                  checked={image}
                  onChange={e => setImage(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </div>
              {/* Image Size Dropdown */}
              <div className="mb-4">
                <label className="block mb-1 font-medium">Image Size</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={imageSize}
                  onChange={e => setImageSize(e.target.value)}
                >
                  <option value="1024x1024">1024x1024</option>
                  <option value="1792x1024">1792x1024</option>
                  <option value="1024x1792">1024x1792</option>
                </select>
              </div>
              {/* Image Style Dropdown */}
              <div className="mb-4">
                <label className="block mb-1 font-medium">Image Style</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={imageStyle}
                  onChange={e => setImageStyle(e.target.value)}
                >
                  <option value="Flat Design">Flat Design</option>
                  <option value="Iconic/Symbolic">Iconic/Symbolic</option>
                  <option value="Modern Abstract">Modern Abstract</option>
                  <option value="Photorealistic">Photorealistic</option>
                  <option value="Infographic">Infographic</option>
                  <option value="3D Infographic">3D Infographic</option>
                  <option value="Hand-drawn/sketch">Hand-drawn/sketch</option>
                </select>
              </div>
              {/* Quiz Question Switch */}
              <div className="mb-4 flex items-center">
                <label className="block font-medium mr-4">Quiz Question</label>
                <input
                  type="checkbox"
                  checked={quizQuestion}
                  onChange={e => setQuizQuestion(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </div>
              {/* Quiz Question Count Dropdown */}
              <div className="mb-4">
                <label className="block mb-1 font-medium">Quiz Question Count</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={quizQuestionCount}
                  onChange={e => setQuizQuestionCount(e.target.value)}
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              {/* Question Branch Switch */}
              <div className="mb-4 flex items-center">
                <label className="block font-medium mr-4">Question Branch</label>
                <input
                  type="checkbox"
                  checked={questionBranch}
                  onChange={e => setQuestionBranch(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </div>
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded"
                  onClick={handlePreviousStep}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="bg-blue-600 text-white px-6 py-2 rounded"
                  onClick={handleNextStep}
                >
                  Next
                </button>
              </div>
            </>
          )}
          {/* Step 3: Data Source Selection */}
          {step === 3 && (
            <>
              {/* Stepper */}
              <div className="flex items-center mb-6">
                <div className={`rounded-full w-8 h-8 flex items-center justify-center ${step >= 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                <div className="flex-1 h-0.5 bg-gray-300 mx-2" />
                <div className={`rounded-full w-8 h-8 flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                <div className="flex-1 h-0.5 bg-gray-300 mx-2" />
                <div className={`rounded-full w-8 h-8 flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Select Data Source</h2>
              <div className="space-y-3 mb-8">
                {dataSources.map(ds => (
                  <label
                    key={ds.key}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer ${selectedDataSource === ds.key ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                  >
                    <input
                      type="radio"
                      name="dataSource"
                      value={ds.key}
                      checked={selectedDataSource === ds.key}
                      onChange={() => setSelectedDataSource(ds.key)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`${ds.color} p-2 rounded-lg bg-gray-100`}>{ds.icon}</div>
                      <div>
                        <div className="font-medium text-gray-900">{ds.title}</div>
                        <div className="text-sm text-gray-600">{ds.description}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded"
                  onClick={handlePreviousStep}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="bg-blue-600 text-white px-6 py-2 rounded flex items-center justify-center min-w-[140px]"
                  onClick={handleGenerateTopics}
                  disabled={!selectedDataSource || topicsLoading}
                >
                  {topicsLoading ? (
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                  ) : null}
                  {topicsLoading ? 'Generating...' : 'Generate Topics'}
                </button>
              </div>
            </>
          )}
          {/* Step 4: Generated Topics */}
          {step === 4 && (
            <>
              <h2 className="text-xl font-semibold mb-4">Generated Topics</h2>
              <div className="space-y-3 mb-8">
                {generatedTopics.map((topic, idx) => (
                  <div key={idx} className="flex items-center border rounded-lg px-4 py-3 justify-between">
                    <span>{topic.topicName}</span>
                    <div className="flex items-center space-x-2">
                      <button type="button" onClick={e => { e.preventDefault(); openEditModal(idx); }} className="p-1 hover:bg-gray-100 rounded">
                        {/* Edit icon (pencil) */}
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6v-3.586a1 1 0 01.293-.707l9-9a1 1 0 011.414 0l3.586 3.586a1 1 0 010 1.414l-9 9A1 1 0 013.586 19H3z"/></svg>
                      </button>
                      <button type="button" onClick={() => openDeleteConfirm(idx)} className="p-1 hover:bg-gray-100 rounded">
                        {/* Delete icon (trash) */}
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M9 6v12a2 2 0 002 2h2a2 2 0 002-2V6m-6 0V4a2 2 0 012-2h2a2 2 0 012 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex space-x-4">
                <button type="button" className="bg-blue-600 text-white px-6 py-2 rounded" onClick={handleGenerateAITutor}>Generate</button>
                <button type="button" className="bg-blue-600 text-white px-6 py-2 rounded" onClick={handleGenerateInBackground}>Generate in Background</button>
              </div>
              {/* Edit Topic Modal */}
              {editModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-8 relative">
                    {/* Header with black background */}
                    <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between rounded-t-lg -mt-8 -mx-8 mb-6">
                      <h2 className="text-lg font-semibold">Update Topic</h2>
                      <button onClick={closeEditModal} className="p-1 text-white hover:text-gray-300 transition-colors text-2xl">&times;</button>
                    </div>
                    {/* Modal content */}
                    <div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Topic Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={editTopicName}
                          onChange={e => setEditTopicName(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="mb-4 flex">
                        <input
                          type="text"
                          placeholder="Trigger Phrase"
                          value={editTriggerInput}
                          onChange={e => setEditTriggerInput(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddTrigger}
                          className="bg-blue-600 text-white px-4 rounded-r-lg"
                        >Add</button>
                      </div>
                      <div className="mb-6 flex flex-wrap gap-2">
                        {editTriggers.map(trigger => (
                          <span key={trigger} className="px-3 py-1 border rounded-full bg-gray-100 flex items-center">
                            {trigger}
                            <button onClick={() => handleRemoveTrigger(trigger)} className="ml-2 text-gray-400 hover:text-red-500">&times;</button>
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="w-full bg-blue-600 text-white py-3 rounded"
                        onClick={handleSaveEditTopic}
                        disabled={!editTopicName.trim()}
                      >Save</button>
                    </div>
                  </div>
                </div>
              )}
              {/* Delete Confirmation Modal */}
              {deleteConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 relative text-center">
                    <h2 className="text-lg font-semibold mb-6">Are you sure you want to perform this action?</h2>
                    <div className="flex justify-center space-x-4">
                      <button
                        type="button"
                        className="bg-blue-600 text-white px-6 py-2 rounded"
                        onClick={handleDeleteTopic}
                      >Yes</button>
                      <button
                        type="button"
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded"
                        onClick={closeDeleteConfirm}
                      >Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </form>
      </div>
      {isThumbnailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-xs relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => setIsThumbnailModalOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-center mb-6">Thumbnail Image</h2>
            <div className="flex flex-col gap-4">
              <button
                type="button"
                className="flex flex-col items-center justify-center border border-gray-300 rounded-lg py-6 hover:bg-gray-50 transition-colors"
                onClick={() => document.getElementById('thumbnail-upload-input')?.click()}
              >
                <Upload className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-base font-medium text-gray-700">Upload Image</span>
              </button>
              <input
                id="thumbnail-upload-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleThumbnailFileChange}
              />
              <button
                type="button"
                className="flex flex-col items-center justify-center border border-gray-300 rounded-lg py-6 hover:bg-gray-50 transition-colors"
                onClick={handleGenerateWithAIClick}
              >
                <Cpu className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-base font-medium text-gray-700">Generate with AI</span>
              </button>
            </div>
            {thumbnailPreview && (
              <div className="mt-6 flex flex-col items-center">
                <img src={thumbnailPreview} alt="Thumbnail Preview" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8 }} />
                <button
                  type="button"
                  onClick={handleRemoveThumbnail}
                  className="mt-2 text-red-600 hover:underline"
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {isGenerateAIModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-3xl relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setIsGenerateAIModalOpen(false);
                setAIGeneratedImage('');
              }}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold text-center mb-6">Generate Thumbnail Image</h2>
            <div className="mb-6">
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 text-base mb-4"
                rows={3}
                placeholder="Image Description"
                value={aiImageDescription}
                onChange={e => setAIImageDescription(e.target.value)}
                disabled={isGeneratingAIImage}
              />
              <select
                className="w-full border border-gray-200 rounded-lg p-3 text-base bg-gray-100 mb-4"
                value={aiImageType}
                onChange={e => setAIImageType(e.target.value)}
                disabled={isGeneratingAIImage}
              >
                <option value="">Type</option>
                {aiImageTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {aiGeneratedImage && (
                <div className="mb-4 flex flex-col items-start">
                  <img src={aiGeneratedImage} alt="Generated Thumbnail" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8 }} />
                </div>
              )}
              {aiImageError && <div className="text-red-600 mb-2 text-sm">{aiImageError}</div>}
              <div className="flex gap-2 mt-4">
                {aiGeneratedImage ? (
                  <>
                    <button
                      type="button"
                      className="flex-1 border border-blue-600 text-blue-600 bg-white py-3 rounded-lg font-medium text-base hover:bg-blue-50 transition-colors"
                      onClick={handleAIModalRegenerate}
                      disabled={isGeneratingAIImage}
                    >
                      {isGeneratingAIImage ? 'Regenerating...' : 'Regenerate'}
                    </button>
                    <button
                      type="button"
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium text-base hover:bg-blue-700 transition-colors"
                      onClick={handleAIModalNext}
                      disabled={isGeneratingAIImage}
                    >
                      Next
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium text-base hover:bg-blue-700 transition-colors"
                    onClick={handleGenerateAIImage}
                    disabled={!aiImageDescription || !aiImageType || isGeneratingAIImage}
                  >
                    {isGeneratingAIImage ? 'Generating...' : 'Generate with AI'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITutorCreationDialog; 