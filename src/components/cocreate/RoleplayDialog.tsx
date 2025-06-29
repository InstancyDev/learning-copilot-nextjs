'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    X,
    ArrowLeft,
    ArrowRight,
    ImageIcon,
    ChevronDown,
    ChevronUp,
    FileText,
    Youtube,
    Globe,
    Search,
    Bot,
    Check,
    Upload,
    Cpu,
} from 'lucide-react';
import ResourceSelectionInterface from './ResourceSelectionInterface';
import { generateRoleplayWithAI, saveRoleplayContent, getContentKeywords, getUserSkills, generateBackgroundImageWithAI, getRolePlayAssistantFlowId, generateThumbnailWithAI, SaveContentJSONData, saveBackgroundImageData } from '../../services/api.service';
import { getSiteConfigValue } from '../../services/api.service';
import { SwatchesPicker } from 'react-color';
import { sessionUtils } from '../../utils/auth';

interface RoleplayDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (data: any) => void;
}

interface FormData {
    title: string;
    description: string;
    skills: number[];
    tags: string[];
    thumbnailBase64?: string | null;
    thumbnailName?: string | null;
    dataSource: string;
    selectedResource?: any;
    additionalData?: any;
}

interface DataSourceOption {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

// Skill type for clarity
interface SkillOption {
    OrgUnitID: number;
    PreferrenceID: number;
    PreferrenceTitle: string;
    ShortSkillName: string;
}

const RoleplayDialog: React.FC<RoleplayDialogProps> = ({
    isOpen,
    onClose,
    onGenerate,
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const initialFormData: FormData = {
        title: '',
        description: '',
        skills: [],
        tags: [],
        thumbnailBase64: null,
        thumbnailName: null,
        dataSource: 'llm',
    };
    const initialRoleplayDetails = {
        Scenario: {
            LearningObjective: '',
            ScenarioDescription: '',
            LearnerRoleDescription: '',
            NumberOfMessages: '',
            UpperLimit: '',
            BackgroundScene: false,
            BackgroundType: '',
            BackgroundValue: '',
            BackgroundImagePrompt: '',
        },
        SimulatedParticipant: {
            SimulatedParticipantName: '',
            SimulatedParticipantRoleDescription: '',
            SimulatedParticipantOpeningStatement: '',
            SimulatedParticipantTone: '',
            IsParticipantAvatar: false,
        },
        SimulatedGuide: {
            GuideName: '',
            GuideDescription: '',
            GuideTone: '',
            GuideDataSource: 'Large Language Model (LLM)',
            IsGuideAvatar: false,
        },
        IntroductionClosing: {
            WelcomeMessage: '',
            RolePlayCompletionMessage: '',
            WhoWillConclude: '',
            ConclusionMessage: '',
        },
        Evaluation: {
            EvaluationIntroMessage: '',
            IsEveluation: false,
            EvaluationCriteriaDescription: '',
            EvaluationFeedbackMechanisms: '',
            IsScore: false,
        },
    };
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [roleplayDetails, setRoleplayDetails] = useState(initialRoleplayDetails);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [expandedSections, setExpandedSections] = useState<string[]>(['scenario']);
    const [showResourceSelection, setShowResourceSelection] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [tagsOptions, setTagsOptions] = useState<string[]>([]);
    const [skillsOptions, setSkillsOptions] = useState<SkillOption[]>([]);
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
    const [backgroundImageName, setBackgroundImageName] = useState<string | null>(null);
    const [aiBackgroundDesc, setAiBackgroundDesc] = useState('');
    const [aiBackgroundLoading, setAiBackgroundLoading] = useState(false);
    const [aiBackgroundError, setAiBackgroundError] = useState<string | null>(null);
    const [aiBackgroundImage, setAiBackgroundImage] = useState<string | null>(null);
    const [backgroundColor, setBackgroundColor] = useState(roleplayDetails.Scenario.BackgroundValue || '#ffffff');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [isThumbnailModalOpen, setIsThumbnailModalOpen] = useState(false);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [isGenerateAIModalOpen, setIsGenerateAIModalOpen] = useState(false);
    const [aiImageDescription, setAIImageDescription] = useState('');
    const [aiImageType, setAIImageType] = useState('');
    const [isGeneratingAIImage, setIsGeneratingAIImage] = useState(false);
    const [aiImageError, setAIImageError] = useState<string | null>(null);
    const [aiGeneratedImage, setAIGeneratedImage] = useState<string>('');
    const [showBackgroundModal, setShowBackgroundModal] = useState(false);
    const aiImageTypes = [
        'Flat design',
        'Iconic/Symbolic',
        'Modern Abstract',
        'Photorealistic',
        'Infographic',
        '3D Infographic',
        'Hand-drawn/Sketch',
    ];

    const sectionTitles: { [key: string]: string } = {
        scenario: 'Scenario',
        participant: 'Simulated Participant',
        guide: 'Simulated Guide',
        introClosing: 'Introduction & Closing',
        evaluation: 'Evaluation',
    };

    const allDataSourceOptions: DataSourceOption[] = [
        { id: 'llm', name: 'Large Language Model (LLM)', description: 'Generate content using AI', icon: <Bot className="w-5 h-5" />, color: 'text-purple-600' },
        { id: 'youtube-search', name: 'YouTube Search', description: 'Search and import from YouTube', icon: <Youtube className="w-5 h-5" />, color: 'text-red-500' },
        { id: 'internet-search', name: 'Internet Search', description: 'Search and import from the web', icon: <Search className="w-5 h-5" />, color: 'text-blue-500' },
        { id: 'youtube', name: 'YouTube', description: 'Import from a YouTube URL', icon: <Youtube className="w-5 h-5" />, color: 'text-red-600' },
        { id: 'website', name: 'Website', description: 'Import from a website URL', icon: <Globe className="w-5 h-5" />, color: 'text-green-600' },
        { id: 'document', name: 'Document', description: 'Import from a document', icon: <FileText className="w-5 h-5" />, color: 'text-blue-600' },
    ];

    useEffect(() => {
        if (isOpen) {
            console.log('RoleplayDialog opened, fetching tags and skills...');
            setCurrentStep(1);
            setFormData(initialFormData);
            setRoleplayDetails(initialRoleplayDetails);
            setThumbnailPreview(null);
            setExpandedSections(['scenario']);
            setShowResourceSelection(false);
            setAiError(null);
            const fetchTagsAndSkills = async () => {
                try {
                    const [keywords, skills] = await Promise.all([
                        getContentKeywords(),
                        getUserSkills(),
                    ]);
                    setTagsOptions(keywords);
                    setSkillsOptions(skills);
                } catch (error) {
                    console.error('Failed to fetch tags or skills:', error);
                    setTagsOptions([]);
                    setSkillsOptions([]);
                }
            };
            fetchTagsAndSkills();
        }
    }, [isOpen]);

    const handleInputChange = (field: keyof FormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSkillsChange = (skillId: number) => {
        setFormData((prev) => ({
            ...prev,
            skills: prev.skills.includes(skillId)
                ? prev.skills.filter((s) => s !== skillId)
                : [...prev.skills, skillId],
        }));
    };

    const handleTagsChange = (tag: string) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter((t) => t !== tag)
                : [...prev.tags, tag],
        }));
    };

    const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData((prev) => ({
                    ...prev,
                    thumbnailBase64: e.target?.result as string,
                    thumbnailName: file.name,
                }));
                setThumbnailPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleSection = (sectionId: string) => {
        setExpandedSections((prev) =>
            prev.includes(sectionId)
                ? prev.filter((id) => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
            if (currentStep + 1 === 3) {
                setExpandedSections([]);
            }
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleDataSourceSelect = (sourceId: string) => {
        setFormData(prev => ({ ...prev, dataSource: sourceId }));

         
    };

    const handleResourceSelect = (resource: any) => {
        setFormData(prev => ({
            ...prev,
            selectedResource: resource,
            additionalData: { resourceType: resource.type, resourceUrl: resource.url }
        }));
        setShowResourceSelection(false);

        if (!formData.title && resource.title) {
            setFormData(prev => ({ ...prev, title: resource.title }));
        }
    };

    const isStep1Valid = formData.title.trim() !== '' && formData.description.trim() !== '';
    const isStep2Valid = formData.dataSource !== '';
    const isStep3Valid =
        !!roleplayDetails.Scenario.LearningObjective &&
        !!roleplayDetails.Scenario.ScenarioDescription &&
        !!roleplayDetails.Scenario.LearnerRoleDescription &&
        !!roleplayDetails.Scenario.NumberOfMessages &&
        !!roleplayDetails.SimulatedParticipant.SimulatedParticipantName &&
        !!roleplayDetails.SimulatedParticipant.SimulatedParticipantRoleDescription &&
        !!roleplayDetails.SimulatedParticipant.SimulatedParticipantOpeningStatement &&
        !!roleplayDetails.SimulatedParticipant.SimulatedParticipantTone &&
        !!roleplayDetails.SimulatedGuide.GuideName &&
        !!roleplayDetails.SimulatedGuide.GuideDescription &&
        !!roleplayDetails.SimulatedGuide.GuideTone &&
        !!roleplayDetails.SimulatedGuide.GuideDataSource &&
        !!roleplayDetails.IntroductionClosing.WelcomeMessage &&
        !!roleplayDetails.IntroductionClosing.RolePlayCompletionMessage &&
        !!roleplayDetails.IntroductionClosing.ConclusionMessage &&
        !!roleplayDetails.Evaluation.EvaluationIntroMessage;

    const handleGenerateWithAI = async () => {
        setAiLoading(true);
        setAiError(null);
        try {
            const ai = await generateRoleplayWithAI({
                question: 'generate',
                promptValues: {
                    learning_objective: formData.title,
                    audience: '',
                    tone: '',
                },
            });
            if (ai) {
                setRoleplayDetails({
                    Scenario: {
                        LearningObjective: ai.LearningObjective || '',
                        ScenarioDescription: ai.ScenarioDescription || '',
                        LearnerRoleDescription: ai.LearnerRoleDescription || '',
                        NumberOfMessages: '10',
                        UpperLimit: '',
                        BackgroundScene: false,
                        BackgroundType: '',
                        BackgroundValue: '',
                        BackgroundImagePrompt: '',
                    },
                    SimulatedParticipant: {
                        SimulatedParticipantName: ai.SimulatedParticipantName || '',
                        SimulatedParticipantRoleDescription: ai.SimulatedParticipantRoleDescription || '',
                        SimulatedParticipantOpeningStatement: ai.SimulatedParticipantOpeningStatement || '',
                        SimulatedParticipantTone: ai.SimulatedParticipantTone || '',
                        IsParticipantAvatar: false,
                    },
                    SimulatedGuide: {
                        GuideName: ai.GuideName || '',
                        GuideDescription: ai.GuideDescription || '',
                        GuideTone: ai.GuideTone || '',
                        GuideDataSource: 'llm',
                        IsGuideAvatar: false,
                    },
                    IntroductionClosing: {
                        WelcomeMessage: ai.WelcomeMessage || '',
                        RolePlayCompletionMessage: ai.RolePlayCompletionMessage || '',
                        WhoWillConclude: 'Learner',
                        ConclusionMessage: ai.ConclusionMessage || '',
                    },
                    Evaluation: {
                        EvaluationIntroMessage: ai.EvaluationIntroMessage || '',
                        IsEveluation: false,
                        EvaluationCriteriaDescription: '',
                        EvaluationFeedbackMechanisms: '',
                        IsScore: false,
                    }
                });
                setExpandedSections([]);
            }
        } catch (err: any) {
            setAiError(err?.message || 'Failed to generate with AI');
        } finally {
            setAiLoading(false);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Get user from session
            const user = sessionUtils.getUserFromSession();
            if (!user) throw new Error('User not authenticated');
            // Fetch the botId (flowID)
            const botId = await getRolePlayAssistantFlowId(user.SiteID, user.JwtToken, 'rolePlay_Assistant_llm');
            // Validation for Evaluation fields
            if (roleplayDetails.Evaluation.IsEveluation) {
                if (!roleplayDetails.Evaluation.EvaluationCriteriaDescription) {
                    setError('Criteria Description is required when Evaluation is enabled.');
                    setIsLoading(false);
                    return;
                }
                if (!roleplayDetails.Evaluation.EvaluationFeedbackMechanisms) {
                    setError('Feedback Mechanisms is required when Evaluation is enabled.');
                    setIsLoading(false);
                    return;
                }
            }
            const FolderID = Number(getSiteConfigValue('CoCreateKnowledgeDefaultFolderID')) || 1403;
            const CMSGroupID = Number(getSiteConfigValue('CoCreateKnowledgeDefaultCMSGroupID')) || 80;
            const ObjectTypeID = 699; // Role Play
            const MediaTypeID = 86; // Roleplay Media Type
            const CategoryType = '';
            const ActionType = 'create';
            const isContentShared = 'false';
            const Categories = '';
            const UnAssignCategories = '';

            // Data source mapping
            let scenarioDataSource = '';
            let scenarioDataSourceType = '';
            if (formData.dataSource === 'llm') {
                scenarioDataSource = 'Large Language Model (LLM)';
                scenarioDataSourceType = 'llm';
            } else {
                scenarioDataSource = formData.dataSource;
                scenarioDataSourceType = formData.dataSource;
            }

            // Background type mapping
            let backgroundType = '';
            if (!roleplayDetails.Scenario.BackgroundType || roleplayDetails.Scenario.BackgroundType === 'image' || roleplayDetails.Scenario.BackgroundType === 'ai') {
                backgroundType = 'bgimage';
            } else if (roleplayDetails.Scenario.BackgroundType === 'color') {
                backgroundType = 'bgcolor';
            }

            // Compose additionalData (roleplay details, etc)
            const additionalData = {
                Title: formData.title,
                LearningObjective: roleplayDetails.Scenario.LearningObjective,
                ScenarioDescription: roleplayDetails.Scenario.ScenarioDescription,
                LearnerRoleDescription: roleplayDetails.Scenario.LearnerRoleDescription,
                NumberOfMessages: roleplayDetails.Scenario.NumberOfMessages,
                UpperLimit: roleplayDetails.Scenario.UpperLimit ? parseInt(roleplayDetails.Scenario.UpperLimit, 10) : 0,
                ScenarioDataSource: scenarioDataSource,
                ScenarioDataSourceValue: '',
                ScenarioDataSourceType: scenarioDataSourceType,
                ScenarioDataSourceFileData: '',
                BackgroundScene: roleplayDetails.Scenario.BackgroundScene,
                BackgroundType: backgroundType,
                BackgroundValue: roleplayDetails.Scenario.BackgroundValue,
                BackgroundImagePrompt: roleplayDetails.Scenario.BackgroundImagePrompt,
                SimulatedParticipantName: roleplayDetails.SimulatedParticipant.SimulatedParticipantName,
                SimulatedParticipantRoleDescription: roleplayDetails.SimulatedParticipant.SimulatedParticipantRoleDescription,
                SimulatedParticipantOpeningStatement: roleplayDetails.SimulatedParticipant.SimulatedParticipantOpeningStatement,
                SimulatedParticipantTone: roleplayDetails.SimulatedParticipant.SimulatedParticipantTone,
                IsParticipantAvatar: roleplayDetails.SimulatedParticipant.IsParticipantAvatar,
                ParticipantAvatarID: '',
                ParticipantAvatarVoiceID: '',
                GuideName: roleplayDetails.SimulatedGuide.GuideName,
                GuideDescription: roleplayDetails.SimulatedGuide.GuideDescription,
                GuideTone: roleplayDetails.SimulatedGuide.GuideTone,
                IsGuideAvatar: roleplayDetails.SimulatedGuide.IsGuideAvatar,
                GuideAvatarID: '',
                GuideAvatarVoiceID: '',
                GuideDataSource: roleplayDetails.SimulatedGuide.GuideDataSource === 'llm' ? 'Large Language Model (LLM)' : roleplayDetails.SimulatedGuide.GuideDataSource,
                GuideDataSourceValue: '',
                GuideDataSourceType: '',
                GuideDataSourceFileData: '',
                WelcomeMessage: roleplayDetails.IntroductionClosing.WelcomeMessage,
                RolePlayCompletionMessage: roleplayDetails.IntroductionClosing.RolePlayCompletionMessage,
                ConclusionMessage: roleplayDetails.IntroductionClosing.ConclusionMessage,
                WhoWillConclude: roleplayDetails.IntroductionClosing.WhoWillConclude,
                IsEveluation: roleplayDetails.Evaluation.IsEveluation,
                EvaluationCriteriaDescription: roleplayDetails.Evaluation.EvaluationCriteriaDescription,
                EvaluationFeedbackMechanisms: roleplayDetails.Evaluation.EvaluationFeedbackMechanisms,
                EvaluationIntroMessage: roleplayDetails.Evaluation.EvaluationIntroMessage,
                IsScore: roleplayDetails.Evaluation.IsScore,
            };
            // Compose formData for the content item
            const contentFormData = {
                Language: 'en-us',
                StartPage: '',
                Name: formData.title,
                TagName: formData.tags.join(','),
                VideoIntroduction: '',
                ShortDescription: formData.description,
                LongDescription: '',
                LearningObjectives: '',
                TableofContent: '',
                Keywords: '',
                NoofModules: '',
                GroupCodeID: '',
                ContentCode: '',
                MediaTypeID: String(MediaTypeID),
                EventStartDateTime: '',
                EventEndDateTime: '',
                RegistrationURL: '',
                Location: '',
                Duration: 0,
                TotalAttempts: 0,
                EnrollmentLimit: 0,
                Bit3: false,
            };
            // First, save roleplay content and get the response
            const saveResp = await saveRoleplayContent({
                Language: 'en-us',
                authorName: user?.UserDisplayName || 'Unknown',
                additionalData: '', // JSON.stringify(additionalData),
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
                ThumbnailImageName: formData.thumbnailName || '',
                ThumbnailImage: formData.thumbnailBase64 || '',
                UnAssignCategories,
            });
            // After saveRoleplayContent, build fileData if needed
            let fileData = '';
            // TODO: Implement file data handling for scenario and guide files
            // This section needs to be updated when the roleplayDetails interface is properly defined
            // with the required properties: scenarioFileChanged, scenarioDataSourceFileData, etc.
            /*
            if (roleplayDetails.Scenario.scenarioFileChanged || roleplayDetails.SimulatedGuide.GuideFileChanged) {
                const FileData = {
                    scenarioBase64File: roleplayDetails.Scenario.scenarioFileChanged ? roleplayDetails.Scenario.scenarioDataSourceFileData : '',
                    scenarioFileName: roleplayDetails.Scenario.scenarioFileChanged ? roleplayDetails.Scenario.scenarioDataSourceValue : '',
                    scenarioFileType: roleplayDetails.Scenario.scenarioFileChanged ? roleplayDetails.Scenario.scenarioDataSourceType : '',
                    evaluatorBase64File: roleplayDetails.SimulatedGuide.GuideFileChanged ? roleplayDetails.SimulatedGuide.GuideDataSourceFileData : '',
                    evaluatorFileName: roleplayDetails.SimulatedGuide.GuideFileChanged ? roleplayDetails.SimulatedGuide.GuideDataSourceValue : '',
                    evaluatorFileType: roleplayDetails.SimulatedGuide.GuideFileChanged ? roleplayDetails.SimulatedGuide.GuideDataSourceType : '',
                    sessionID: saveResp?.contentId || '',
                    siteID: user?.SiteID || '',
                };
                fileData = JSON.stringify(FileData);
            }
            */
            // Then, call SaveContentJSONData with contentId and folderPath from the response if available
            await SaveContentJSONData({
                contentId: saveResp?.contentId || '',
                folderPath: saveResp?.folderPath || '',
                contentData: JSON.stringify(additionalData),
                objectTypeId: ObjectTypeID,
                userID: Number(user?.UserID) || 0,
                fileData,
            });
            //await refreshMyKnowledge?.();
            onClose();
            onGenerate({ refreshed: true });
        } catch (err: any) {
            setError(err?.message || 'Failed to save content');
        } finally {
            setIsLoading(false);
        }
    };

    // Handler for image upload
    const handleBackgroundImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setBackgroundImage(e.target?.result as string);
                setBackgroundImageName(file.name);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handler for AI image generation
    const handleGenerateBackgroundWithAI = async () => {
        setAiBackgroundLoading(true);
        setAiBackgroundError(null);
        setAiBackgroundImage(null);
        try {
            const data = await generateBackgroundImageWithAI({ description: aiBackgroundDesc });
            if (data && data.image_base64) {
                setAiBackgroundImage(`data:image/png;base64,${data.image_base64}`);
            } else {
                setAiBackgroundError('No image returned from AI.');
            }
        } catch (err) {
            setAiBackgroundError('Failed to generate image.');
        } finally {
            setAiBackgroundLoading(false);
        }
    };

    // Handler for color picker
    const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBackgroundColor(e.target.value);
        setRoleplayDetails(d => ({ ...d, Scenario: { ...d.Scenario, BackgroundValue: e.target.value } }));
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
                // Update your form state here if needed
            };
            reader.readAsDataURL(file);
            setIsThumbnailModalOpen(false);
        }
    };

    const handleRemoveThumbnail = () => {
        setThumbnailFile(null);
        setThumbnailPreview('');
        // Update your form state here if needed
    };

    const handleGenerateWithAIClick = () => {
        setIsThumbnailModalOpen(false);
        setIsGenerateAIModalOpen(true);
    };

    const handleGenerateAIImage = async () => {
        setIsGeneratingAIImage(true);
        setAIImageError(null);
        try {
            const resp = await generateThumbnailWithAI({
                content: aiImageDescription,
                style: aiImageType,
            });
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
        // Update your form state here if needed
        setIsGenerateAIModalOpen(false);
        setAIImageDescription('');
        setAIImageType('');
        setAIGeneratedImage('');
    };

    const handleAIModalRegenerate = () => {
        handleGenerateAIImage();
    };

    const handleApplyBackground = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const user = sessionUtils.getUserFromSession();
            if (!user) throw new Error('User not authenticated');
            const FolderID = Number(getSiteConfigValue('CoCreateKnowledgeDefaultFolderID')) || 1403;
            const CMSGroupID = Number(getSiteConfigValue('CoCreateKnowledgeDefaultCMSGroupID')) || 80;
            let imagePath = '';
            if ((roleplayDetails.Scenario.BackgroundType === 'image' && backgroundImage) || (!roleplayDetails.Scenario.BackgroundType && backgroundImage)) {
                // User uploaded image
                const resp = await saveBackgroundImageData({
                    FolderID,
                    UserID: user.UserID,
                    SiteID: user.SiteID,
                    CMSGroupID,
                    ImageStream: backgroundImage,
                    ImageName: backgroundImageName || 'background_image.png',
                });
                imagePath = resp.img;
            } else if ((roleplayDetails.Scenario.BackgroundType === 'ai' || roleplayDetails.Scenario.BackgroundType =='bgimage') && aiBackgroundImage) {
                // AI generated image
                const resp = await saveBackgroundImageData({
                    FolderID,
                    UserID: user.UserID,
                    SiteID: user.SiteID,
                    CMSGroupID,
                    ImageStream: aiBackgroundImage,
                    ImageName: 'ai_generated.png',
                });
                imagePath = resp.img;
            }
            setRoleplayDetails(d => ({
                ...d,
                Scenario: {
                    ...d.Scenario,
                    BackgroundValue: imagePath
                }
            }));
            setShowBackgroundModal(false);
        } catch (err) {
            setError('Failed to save background image');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Roleplay dialog modal (no black overlay) */}
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                    <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                        <div className="bg-slate-800 text-white px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={onClose}
                                        className="p-1 text-white hover:text-gray-300 transition-colors"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <h2 className="text-lg font-semibold">Create Roleplay</h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1 text-white hover:text-gray-300 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mt-4">
                                {[1, 2, 3].map((step) => (
                                    <div key={step} className="flex items-center">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === currentStep
                                                    ? 'bg-blue-600 text-white'
                                                    : step < currentStep
                                                        ? 'bg-green-600 text-white'
                                                        : 'bg-gray-600 text-gray-300'
                                                }`}
                                        >
                                            {step < currentStep ? <Check className="w-4 h-4" /> : step}
                                        </div>
                                        {step < 3 && (
                                            <div
                                                className={`w-12 h-0.5 mx-2 ${step < currentStep ? 'bg-green-600' : 'bg-gray-600'
                                                    }`}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 h-[60vh] overflow-y-auto">
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Initial Details</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => handleInputChange('title', e.target.value)}
                                            placeholder="Enter roleplay title..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            placeholder="Describe the roleplay scenario..."
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                                        <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                {skillsOptions.map((skill) => (
                                                    <label
                                                        key={skill.PreferrenceID}
                                                        className="flex items-center space-x-2 cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.skills.includes(skill.PreferrenceID)}
                                                            onChange={() => handleSkillsChange(skill.PreferrenceID)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm text-gray-700">{skill.ShortSkillName || skill.PreferrenceTitle}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                                        <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                {tagsOptions.map((tag) => (
                                                    <label
                                                        key={tag}
                                                        className="flex items-center space-x-2 cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.tags.includes(tag)}
                                                            onChange={() => handleTagsChange(tag)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm text-gray-700">#{tag}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image</label>
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
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Data Source</h3>
                                    <div className="space-y-3">
                                        {allDataSourceOptions.map((option) => (
                                            <label
                                                key={option.id}
                                                className={`flex items-center p-4 border rounded-lg cursor-pointer ${formData.dataSource === option.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="dataSource"
                                                    value={option.id}
                                                    checked={formData.dataSource === option.id}
                                                    onChange={(e) => handleDataSourceSelect(e.target.value)}
                                                    className="sr-only"
                                                />
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className={`${option.color} p-2 rounded-lg bg-gray-100`}>{option.icon}</div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{option.name}</div>
                                                        <div className="text-sm text-gray-600">{option.description}</div>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate Roleplay</h3>
                                    {Object.keys(sectionTitles).map((section) => (
                                        <div key={section} className="border border-gray-200 rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => toggleSection(section)}
                                                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left"
                                            >
                                                <span className="font-medium text-gray-900">{sectionTitles[section]}</span>
                                                {expandedSections.includes(section) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                            </button>
                                            {expandedSections.includes(section) && (
                                                <div className="p-4 border-t border-gray-200 space-y-4">
                                                    {section === 'scenario' && (
                                                        <>
                                                            <div>
                                                                <label className="block text-sm font-medium">Learning Objective *</label>
                                                                <input type="text" value={roleplayDetails.Scenario.LearningObjective} onChange={e => setRoleplayDetails(d => ({ ...d, Scenario: { ...d.Scenario, LearningObjective: e.target.value } }))} className="w-full p-2 border rounded" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium">Scenario Description *</label>
                                                                <textarea value={roleplayDetails.Scenario.ScenarioDescription} onChange={e => setRoleplayDetails(d => ({ ...d, Scenario: { ...d.Scenario, ScenarioDescription: e.target.value } }))} className="w-full p-2 border rounded" rows={3}></textarea>
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium">Learner Role Description *</label>
                                                                <textarea value={roleplayDetails.Scenario.LearnerRoleDescription} onChange={e => setRoleplayDetails(d => ({ ...d, Scenario: { ...d.Scenario, LearnerRoleDescription: e.target.value } }))} className="w-full p-2 border rounded" rows={3}></textarea>
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium">Maximum Messages Count</label>
                                                                <select value={roleplayDetails.Scenario.NumberOfMessages} onChange={e => setRoleplayDetails(d => ({ ...d, Scenario: { ...d.Scenario, NumberOfMessages: e.target.value } }))} className="w-full p-2 border rounded">
                                                                    <option value="">Select...</option>
                                                                    <option value="adaptive">Adaptive</option>
                                                                    <option value="3">3 Messages</option>
                                                                    <option value="5">5 Messages</option>
                                                                    <option value="7">7 Messages</option>
                                                                    <option value="10">10 Messages</option>
                                                                </select>
                                                            </div>
                                                            {roleplayDetails.Scenario.NumberOfMessages === 'adaptive' && (
                                                                <div>
                                                                    <label className="block text-sm font-medium">Upper Limit</label>
                                                                    <input type="number" value={roleplayDetails.Scenario.UpperLimit || ''} onChange={e => setRoleplayDetails(d => ({ ...d, Scenario: { ...d.Scenario, UpperLimit: e.target.value } }))} className="w-full p-2 border rounded" min="1" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <label className="inline-flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={roleplayDetails.Scenario.BackgroundScene}
                                                                        onChange={e => setRoleplayDetails(d => ({...d, Scenario: {...d.Scenario, BackgroundScene: e.target.checked}}))}
                                                                        className="mr-2"
                                                                    />
                                                                    Background Scene
                                                                </label>
                                                            </div>
                                                            {roleplayDetails.Scenario.BackgroundScene && (
                                                                <div className="mt-3">
                                                                    <button
                                                                        type="button"
                                                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                                                        onClick={() => setShowBackgroundModal(true)}
                                                                    >
                                                                        Select Background Image
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                    {section === 'participant' && (
                                                         <>
                                                            <div>
                                                                <label className="block text-sm font-medium">Name *</label>
                                                                <input type="text" value={roleplayDetails.SimulatedParticipant.SimulatedParticipantName} onChange={e => setRoleplayDetails(d => ({...d, SimulatedParticipant: {...d.SimulatedParticipant, SimulatedParticipantName: e.target.value}}))} className="w-full p-2 border rounded" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium">Simulated Participant Role Description *</label>
                                                                <textarea value={roleplayDetails.SimulatedParticipant.SimulatedParticipantRoleDescription} onChange={e => setRoleplayDetails(d => ({...d, SimulatedParticipant: {...d.SimulatedParticipant, SimulatedParticipantRoleDescription: e.target.value}}))} className="w-full p-2 border rounded" rows={3}></textarea>
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium">Opening Statement *</label>
                                                                <textarea value={roleplayDetails.SimulatedParticipant.SimulatedParticipantOpeningStatement} onChange={e => setRoleplayDetails(d => ({...d, SimulatedParticipant: {...d.SimulatedParticipant, SimulatedParticipantOpeningStatement: e.target.value}}))} className="w-full p-2 border rounded" rows={3}></textarea>
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium">Simulated Participant Tone *</label>
                                                                <select
                                                                    value={roleplayDetails.SimulatedParticipant.SimulatedParticipantTone}
                                                                    onChange={e => setRoleplayDetails(d => ({...d, SimulatedParticipant: {...d.SimulatedParticipant, SimulatedParticipantTone: e.target.value}}))}
                                                                    className="w-full p-2 border rounded"
                                                                    required
                                                                >
                                                                    <option value="">Select...</option>
                                                                    <option value="Neutral Tone">Neutral Tone</option>
                                                                    <option value="Confident Tone">Confident Tone</option>
                                                                    <option value="Friendly Tone">Friendly Tone</option>
                                                                    <option value="Mysterious Tone">Mysterious Tone</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                              <label className="inline-flex items-center">
                                                                <input
                                                                  type="checkbox"
                                                                  checked={roleplayDetails.SimulatedParticipant.IsParticipantAvatar}
                                                                  onChange={e => setRoleplayDetails(d => ({...d, SimulatedParticipant: {...d.SimulatedParticipant, IsParticipantAvatar: e.target.checked}}))}
                                                                  className="mr-2"
                                                                />
                                                                Avatar
                                                              </label>
                                                            </div>
                                                        </>
                                                    )}
                                                    {section === 'guide' && (
                                                         <>
                                                            <div>
                                                                <label className="block text-sm font-medium">Name *</label>
                                                                <input type="text" value={roleplayDetails.SimulatedGuide.GuideName} onChange={e => setRoleplayDetails(d => ({...d, SimulatedGuide: {...d.SimulatedGuide, GuideName: e.target.value}}))} className="w-full p-2 border rounded" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium">Description *</label>
                                                                <textarea value={roleplayDetails.SimulatedGuide.GuideDescription} onChange={e => setRoleplayDetails(d => ({...d, SimulatedGuide: {...d.SimulatedGuide, GuideDescription: e.target.value}}))} className="w-full p-2 border rounded" rows={3}></textarea>
                                                            </div>
                                                            <div>
                                                              <label className="block text-sm font-medium mb-1">Tone</label>
                                                              <select
                                                                value={roleplayDetails.SimulatedGuide.GuideTone}
                                                                onChange={e => setRoleplayDetails(d => ({...d, SimulatedGuide: {...d.SimulatedGuide, GuideTone: e.target.value}}))}
                                                                className="w-full px-3 py-2 border rounded"
                                                              >
                                                                <option value="">Select...</option>
                                                                <option value="neutral">Neutral Tone</option>
                                                                <option value="confident">Confident Tone</option>
                                                                <option value="friendly">Friendly Tone</option>
                                                                <option value="mysterious">Mysterious Tone</option>
                                                              </select>
                                                            </div>
                                                            <div>
                                                              <label className="block text-sm font-medium mb-1">Data Source</label>
                                                              <select
                                                                value={roleplayDetails.SimulatedGuide.GuideDataSource}
                                                                onChange={e => setRoleplayDetails(d => ({...d, SimulatedGuide: {...d.SimulatedGuide, GuideDataSource: e.target.value}}))}
                                                                className="w-full px-3 py-2 border rounded"
                                                              >
                                                                <option value="">Select...</option>
                                                                <option value="llm">Large Language Model</option>
                                                                <option value="document">Document Upload</option>
                                                                <option value="website">Website</option>
                                                                <option value="internet">Internet Search</option>
                                                                <option value="youtube">YouTube</option>
                                                                <option value="youtube-search">YouTube Search</option>
                                                              </select>
                                                            </div>
                                                            <div>
                                                                <label className="inline-flex items-center">
                                                                  <input
                                                                    type="checkbox"
                                                                    checked={roleplayDetails.SimulatedGuide.IsGuideAvatar}
                                                                    onChange={e => setRoleplayDetails(d => ({...d, SimulatedGuide: {...d.SimulatedGuide, IsGuideAvatar: e.target.checked}}))}
                                                                    className="mr-2"
                                                                  />
                                                                  Avatar
                                                                </label>
                                                              </div>
                                                            </>
                                                    )}
                                                    {section === 'introClosing' && (
                                                         <>
                                                            <div>
                                                                <label className="block text-sm font-medium">Scenario Introduction Message *</label>
                                                                <textarea value={roleplayDetails.IntroductionClosing.WelcomeMessage} onChange={e => setRoleplayDetails(d => ({...d, IntroductionClosing: {...d.IntroductionClosing, WelcomeMessage: e.target.value}}))} className="w-full p-2 border rounded" rows={3}></textarea>
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium">Scenario Closing Message *</label>
                                                                <textarea value={roleplayDetails.IntroductionClosing.RolePlayCompletionMessage} onChange={e => setRoleplayDetails(d => ({...d, IntroductionClosing: {...d.IntroductionClosing, RolePlayCompletionMessage: e.target.value}}))} className="w-full p-2 border rounded" rows={3}></textarea>
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium">Who will Conclude *</label>
                                                                <select value={roleplayDetails.IntroductionClosing.WhoWillConclude} onChange={e => setRoleplayDetails(d => ({...d, IntroductionClosing: {...d.IntroductionClosing, WhoWillConclude: e.target.value}}))} className="w-full p-2 border rounded">
                                                                    <option value="">Select...</option>
                                                                    <option value="Learner">Learner</option>
                                                                    <option value="Simulated Participant">Simulated Participant</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium">Conclusion Message *</label>
                                                                <textarea value={roleplayDetails.IntroductionClosing.ConclusionMessage} onChange={e => setRoleplayDetails(d => ({...d, IntroductionClosing: {...d.IntroductionClosing, ConclusionMessage: e.target.value}}))} className="w-full p-2 border rounded" rows={3}></textarea>
                                                            </div>
                                                        </>
                                                    )}
                                                    {section === 'evaluation' && (
                                                         <>
                                                            <div>
                                                                <label className="block text-sm font-medium">Introduction Message *</label>
                                                                <textarea value={roleplayDetails.Evaluation.EvaluationIntroMessage} onChange={e => setRoleplayDetails(d => ({...d, Evaluation: {...d.Evaluation, EvaluationIntroMessage: e.target.value}}))} className="w-full p-2 border rounded" rows={3}></textarea>
                                                            </div>
                                                            <label className="inline-flex items-center">
                                                                <input type="checkbox" checked={roleplayDetails.Evaluation.IsEveluation} onChange={e => setRoleplayDetails(d => ({...d, Evaluation: {...d.Evaluation, IsEveluation: e.target.checked}}))} className="mr-2" />
                                                                Evaluation
                                                            </label>
                                                            {roleplayDetails.Evaluation.IsEveluation && (
                                                                <>
                                                                    <div>
                                                                        <label className="block text-sm font-medium">
                                                                            Criteria Description <span className="text-red-500">*</span>
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={roleplayDetails.Evaluation.EvaluationCriteriaDescription}
                                                                            onChange={e => setRoleplayDetails(d => ({...d, Evaluation: {...d.Evaluation, EvaluationCriteriaDescription: e.target.value}}))}
                                                                            className="w-full p-2 border rounded"
                                                                            required
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium">
                                                                            Feedback Mechanisms <span className="text-red-500">*</span>
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={roleplayDetails.Evaluation.EvaluationFeedbackMechanisms}
                                                                            onChange={e => setRoleplayDetails(d => ({...d, Evaluation: {...d.Evaluation, EvaluationFeedbackMechanisms: e.target.value}}))}
                                                                            className="w-full p-2 border rounded"
                                                                            required
                                                                        />
                                                                    </div>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                            <div className="flex items-center gap-2">
                                {currentStep === 2 && (
                                    <button
                                        onClick={handlePrevious}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Previous
                                    </button>
                                )}
                                {currentStep === 3 && (
                                    <button
                                        type="button"
                                        onClick={handleGenerateWithAI}
                                        disabled={aiLoading}
                                        className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg"
                                    >
                                        {aiLoading ? 'Generating...' : 'Generate with AI'}
                                    </button>
                                )}
                                {aiError && <span className="text-red-600 text-sm">{aiError}</span>}
                            </div>
                            <div className="flex items-center gap-2">
                                {currentStep < 3 ? (
                                    <button
                                        onClick={handleNext}
                                        disabled={(currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid)}
                                        className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg disabled:bg-gray-400"
                                    >
                                        Next <ArrowRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSave}
                                        disabled={!isStep3Valid || isLoading}
                                        className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg disabled:bg-gray-400"
                                    >
                                        {isLoading ? 'Saving...' : 'Save'}
                                    </button>
                                )}
                                {error && <span className="text-red-600 text-sm">{error}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Color picker overlay/modal (full black overlay) */}
            {showColorPicker && (
                <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
                    <div className="bg-white p-4 rounded shadow-lg">
                        <SwatchesPicker
                            color={backgroundColor}
                            onChange={(color: { hex: string }) => {
                                setBackgroundColor(color.hex);
                                setRoleplayDetails(d => ({ ...d, Scenario: { ...d.Scenario, BackgroundValue: color.hex } }));
                            }}
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                                onClick={() => setShowColorPicker(false)}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showResourceSelection && (
                <ResourceSelectionInterface
                    onResourceSelect={handleResourceSelect}
                    onClose={() => setShowResourceSelection(false)}
                />
            )}
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
            {showBackgroundModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30">
                    <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowBackgroundModal(false)}
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-lg font-semibold mb-6">Background Scene</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Background Scene Type</label>
                            <select
                                className="w-full border border-gray-300 rounded-lg p-2"
                                value={roleplayDetails.Scenario.BackgroundType}
                                onChange={e => {
                                    const val = e.target.value;
                                    setRoleplayDetails(d => ({ ...d, Scenario: { ...d.Scenario, BackgroundType: val } }));
                                }}
                            >
                                <option value="image">Background Image</option>
                                <option value="ai">Generate Background Image with AI</option>
                                <option value="color">Background Color</option>
                            </select>
                        </div>
                        {/* Background Image Upload */}
                        {(!roleplayDetails.Scenario.BackgroundType || roleplayDetails.Scenario.BackgroundType === 'image') && (
                            <div className="mb-4 flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                                <span className="mb-2 text-gray-600">Upload</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="background-image-upload"
                                    onChange={handleBackgroundImageUpload}
                                />
                                <label htmlFor="background-image-upload" className="cursor-pointer px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-100">Choose File</label>
                                {backgroundImage && (
                                    <img src={backgroundImage} alt="Background Preview" className="mt-4 w-48 h-32 object-cover rounded border" />
                                )}
                                {backgroundImageName && (
                                    <div className="text-xs text-gray-500 mt-1">{backgroundImageName}</div>
                                )}
                            </div>
                        )}
                        {/* AI Generation */}
                        {roleplayDetails.Scenario.BackgroundType === 'ai' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg p-2 mb-2"
                                    rows={2}
                                    placeholder="Description"
                                    value={aiBackgroundDesc}
                                    onChange={e => setAiBackgroundDesc(e.target.value)}
                                />
                                <div className="flex gap-2 mb-2">
                                    <div>
                                        <label className="block text-xs font-medium mb-1">Resolution</label>
                                        <select className="border rounded p-1" disabled>
                                            <option>Square (1024x1024)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium mb-1">Image Type</label>
                                        <select className="border rounded p-1" disabled>
                                            <option>Flat design</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-blue-600 text-white rounded"
                                    onClick={handleGenerateBackgroundWithAI}
                                    disabled={aiBackgroundLoading || !aiBackgroundDesc}
                                >
                                    {aiBackgroundLoading ? 'Generating...' : 'Generate'}
                                </button>
                                {aiBackgroundError && <div className="text-red-600 text-xs mt-1">{aiBackgroundError}</div>}
                                {aiBackgroundImage && (
                                    <img src={aiBackgroundImage} alt="AI Generated Background" className="mt-2 w-48 h-32 object-cover rounded border" />
                                )}
                            </div>
                        )}
                        {/* Color Picker */}
                        {roleplayDetails.Scenario.BackgroundType === 'color' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Pick Background Color</label>
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        className="w-12 h-12 rounded border border-gray-300 shadow cursor-pointer"
                                        style={{ background: backgroundColor }}
                                        onClick={() => setShowColorPicker(true)}
                                    />
                                    <input
                                        type="text"
                                        value={backgroundColor}
                                        readOnly
                                        className="p-2 border border-gray-300 rounded w-32 text-center font-mono bg-gray-50"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded"
                                onClick={() => setShowBackgroundModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                                onClick={handleApplyBackground}
                                disabled={!backgroundImage && !aiBackgroundImage || isLoading}
                            >
                                {isLoading ? 'Applying...' : 'Apply'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RoleplayDialog;