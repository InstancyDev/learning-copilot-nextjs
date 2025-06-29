// src/data/catalog-data-part4.ts
// Catalog data - Part 4 (Modern Content Types: cmi5, Assignment, AR/VR, Chatbot, User Guide, Role Play, Flashcards)

import type { CatalogItem } from '@/types/Catalog';

export const catalogDataPart4: CatalogItem[] = [
    // cmi5 (693) - 2 items
    {
        id: 'cmi5-001',
        title: 'Advanced Excel Analytics',
        description: 'Master Excel for data analysis and business intelligence using cmi5 standard',
        contentTypeId: 693,
        contentType: 'cmi5',
        category: 'Business Analytics',
        difficulty: 'advanced',
        duration: 300,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-015', name: 'Business Analytics Team', avatar: '/api/placeholder/40/40' },
        tags: ['excel', 'analytics', 'business intelligence'],
        rating: { average: 4.5, count: 267 },
        enrollment: { enrolled: 1345 },
        status: 'published',
        createdAt: '2024-03-12T10:45:00Z',
        updatedAt: '2024-06-17T14:20:00Z',
        price: { amount: 129.99, currency: 'USD' },
        prerequisites: ['Basic Excel knowledge'],
        learningObjectives: ['Master advanced formulas', 'Create dashboards', 'Perform data analysis'],
        metadata: { cmi5Compliant: true, adaptiveLearning: true, progressTracking: true },
        viewType: 3, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'cmi5-002',
        title: 'Adaptive Learning Course: Python Programming',
        description: 'Personalized Python learning experience using cmi5 adaptive technology',
        contentTypeId: 693,
        contentType: 'cmi5',
        category: 'Programming',
        difficulty: 'beginner',
        duration: 480,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-006', name: 'Lisa Chen', avatar: '/api/placeholder/40/40' },
        tags: ['python', 'adaptive learning', 'programming'],
        rating: { average: 4.8, count: 189 },
        enrollment: { enrolled: 967 },
        status: 'published',
        createdAt: '2024-05-18T13:30:00Z',
        updatedAt: '2024-06-18T10:45:00Z',
        price: { amount: 149.99, currency: 'USD' },
        prerequisites: ['Basic computer skills'],
        learningObjectives: ['Learn Python syntax', 'Build programs', 'Personalized pace'],
        metadata: { cmi5Compliant: true, adaptiveLearning: true, progressTracking: true, ai: true },
        viewType: 3, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },

    // Assignment (694) - 3 items
    {
        id: 'assign-001',
        title: 'React Portfolio Project',
        description: 'Build a complete portfolio website using React and modern tools',
        contentTypeId: 694,
        contentType: 'Assignment',
        category: 'Frontend Development',
        difficulty: 'intermediate',
        duration: 480,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-002', name: 'Michael Chen', avatar: '/api/placeholder/40/40' },
        tags: ['react', 'portfolio', 'project'],
        rating: { average: 4.6, count: 145 },
        enrollment: { enrolled: 789 },
        status: 'published',
        createdAt: '2024-04-05T09:30:00Z',
        updatedAt: '2024-06-13T11:15:00Z',
        prerequisites: ['React fundamentals', 'JavaScript ES6+'],
        learningObjectives: ['Build real project', 'Apply React concepts', 'Create portfolio'],
        isPartOfPath: ['path-001'],
        metadata: { submissionRequired: true, peerReview: true, deadline: '2 weeks' },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'assign-002',
        title: 'Machine Learning Model Implementation',
        description: 'Implement and evaluate a machine learning model for real-world data',
        contentTypeId: 694,
        contentType: 'Assignment',
        category: 'Data Science',
        difficulty: 'advanced',
        duration: 720,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-004', name: 'Dr. Emily Watson', avatar: '/api/placeholder/40/40' },
        tags: ['machine learning', 'python', 'project'],
        rating: { average: 4.8, count: 98 },
        enrollment: { enrolled: 456 },
        status: 'published',
        createdAt: '2024-04-20T14:15:00Z',
        updatedAt: '2024-06-16T16:30:00Z',
        prerequisites: ['Python programming', 'Statistics', 'ML fundamentals'],
        learningObjectives: ['Implement ML algorithm', 'Evaluate model performance', 'Present findings'],
        isPartOfPath: ['path-002'],
        metadata: { submissionRequired: true, mentorReview: true, deadline: '3 weeks' },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'assign-003',
        title: 'Cloud Infrastructure Design Challenge',
        description: 'Design and implement a scalable cloud infrastructure solution',
        contentTypeId: 694,
        contentType: 'Assignment',
        category: 'Cloud Computing',
        difficulty: 'advanced',
        duration: 600,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-009', name: 'Mark Wilson', avatar: '/api/placeholder/40/40' },
        tags: ['cloud', 'infrastructure', 'design'],
        rating: { average: 4.7, count: 112 },
        enrollment: { enrolled: 334 },
        status: 'published',
        createdAt: '2024-05-22T11:45:00Z',
        updatedAt: '2024-06-17T13:20:00Z',
        prerequisites: ['Cloud fundamentals', 'System design'],
        learningObjectives: ['Design architecture', 'Implement solution', 'Optimize costs'],
        metadata: { submissionRequired: true, expertReview: true, deadline: '4 weeks' },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },

    // AR Module (695) - 3 items
    {
        id: 'ar-001',
        title: 'Anatomy Learning with AR',
        description: 'Interactive anatomy learning using augmented reality technology',
        contentTypeId: 695,
        contentType: 'AR Module',
        category: 'Medical Education',
        difficulty: 'intermediate',
        duration: 180,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-016', name: 'Medical Education Team', avatar: '/api/placeholder/40/40' },
        tags: ['anatomy', 'ar', 'medical', 'interactive'],
        rating: { average: 4.9, count: 234 },
        enrollment: { enrolled: 1123 },
        status: 'published',
        createdAt: '2024-03-25T12:00:00Z',
        updatedAt: '2024-06-11T15:45:00Z',
        price: { amount: 199.99, currency: 'USD' },
        prerequisites: ['Basic biology knowledge'],
        learningObjectives: ['Explore 3D anatomy', 'Understand body systems', 'Interactive learning'],
        metadata: { arSupported: true, deviceRequirements: 'iOS/Android', offline: false },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'ar-002',
        title: 'Industrial Maintenance AR Training',
        description: 'Hands-on industrial equipment maintenance training using AR',
        contentTypeId: 695,
        contentType: 'AR Module',
        category: 'Industrial Training',
        difficulty: 'advanced',
        duration: 240,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-017', name: 'Industrial Training Corp', avatar: '/api/placeholder/40/40' },
        tags: ['maintenance', 'industrial', 'ar', 'safety'],
        rating: { average: 4.7, count: 156 },
        enrollment: { enrolled: 678 },
        status: 'published',
        createdAt: '2024-04-10T11:30:00Z',
        updatedAt: '2024-06-15T13:20:00Z',
        price: { amount: 299.99, currency: 'USD' },
        prerequisites: ['Basic mechanical knowledge', 'Safety certification'],
        learningObjectives: ['Practice maintenance procedures', 'Learn safety protocols', 'Reduce downtime'],
        metadata: { arSupported: true, deviceRequirements: 'HoloLens', specialEquipment: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'ar-003',
        title: 'Architecture Visualization AR',
        description: 'Visualize and interact with architectural designs using AR technology',
        contentTypeId: 695,
        contentType: 'AR Module',
        category: 'Architecture',
        difficulty: 'intermediate',
        duration: 150,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-025', name: 'Architecture Studio', avatar: '/api/placeholder/40/40' },
        tags: ['architecture', 'visualization', 'ar', 'design'],
        rating: { average: 4.6, count: 98 },
        enrollment: { enrolled: 445 },
        status: 'published',
        createdAt: '2024-05-08T14:20:00Z',
        updatedAt: '2024-06-14T12:35:00Z',
        price: { amount: 179.99, currency: 'USD' },
        prerequisites: ['Basic design knowledge'],
        learningObjectives: ['Visualize 3D models', 'Understand spatial relationships', 'Design review'],
        metadata: { arSupported: true, deviceRequirements: 'iOS/Android', models3D: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },

    // VR Module (696) - 3 items
    {
        id: 'vr-001',
        title: 'Virtual Chemistry Lab',
        description: 'Conduct chemistry experiments in a safe virtual environment',
        contentTypeId: 696,
        contentType: 'VR Module',
        category: 'Science Education',
        difficulty: 'intermediate',
        duration: 120,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-018', name: 'Science Education Team', avatar: '/api/placeholder/40/40' },
        tags: ['chemistry', 'vr', 'laboratory', 'experiments'],
        rating: { average: 4.8, count: 189 },
        enrollment: { enrolled: 892 },
        status: 'published',
        createdAt: '2024-03-30T14:45:00Z',
        updatedAt: '2024-06-12T10:25:00Z',
        price: { amount: 149.99, currency: 'USD' },
        prerequisites: ['Basic chemistry knowledge'],
        learningObjectives: ['Conduct safe experiments', 'Understand reactions', 'Practice lab techniques'],
        metadata: { vrSupported: true, deviceRequirements: 'VR headset', immersive: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'vr-002',
        title: 'Flight Simulator Training',
        description: 'Professional pilot training using advanced VR flight simulation',
        contentTypeId: 696,
        contentType: 'VR Module',
        category: 'Aviation Training',
        difficulty: 'advanced',
        duration: 360,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-019', name: 'Aviation Academy', avatar: '/api/placeholder/40/40' },
        tags: ['aviation', 'flight', 'vr', 'simulation'],
        rating: { average: 4.9, count: 145 },
        enrollment: { enrolled: 345 },
        status: 'published',
        createdAt: '2024-04-25T16:20:00Z',
        updatedAt: '2024-06-18T14:10:00Z',
        price: { amount: 899.99, currency: 'USD' },
        prerequisites: ['Pilot license eligibility', 'Medical certification'],
        learningObjectives: ['Master flight controls', 'Handle emergencies', 'Navigation skills'],
        metadata: { vrSupported: true, deviceRequirements: 'High-end VR', specialControls: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'vr-003',
        title: 'Historical Time Travel VR',
        description: 'Experience historical events through immersive VR environments',
        contentTypeId: 696,
        contentType: 'VR Module',
        category: 'History Education',
        difficulty: 'beginner',
        duration: 90,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-026', name: 'History Education Team', avatar: '/api/placeholder/40/40' },
        tags: ['history', 'vr', 'immersive', 'education'],
        rating: { average: 4.7, count: 234 },
        enrollment: { enrolled: 1567 },
        status: 'published',
        createdAt: '2024-05-30T11:10:00Z',
        updatedAt: '2024-06-16T15:25:00Z',
        price: { amount: 89.99, currency: 'USD' },
        prerequisites: [],
        learningObjectives: ['Experience history', 'Understand context', 'Engage with content'],
        metadata: { vrSupported: true, deviceRequirements: 'VR headset', educational: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },

    // Chatbot (697) - 3 items
    {
        id: 'chat-001',
        title: 'Customer Service AI Assistant',
        description: 'Interactive chatbot training for customer service scenarios',
        contentTypeId: 697,
        contentType: 'Chatbot',
        category: 'Customer Service',
        difficulty: 'beginner',
        duration: 60,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-020', name: 'Customer Success Team', avatar: '/api/placeholder/40/40' },
        tags: ['customer service', 'chatbot', 'communication'],
        rating: { average: 4.4, count: 267 },
        enrollment: { enrolled: 1567 },
        status: 'published',
        createdAt: '2024-05-05T10:15:00Z',
        updatedAt: '2024-06-14T12:50:00Z',
        prerequisites: [],
        learningObjectives: ['Practice conversations', 'Handle complaints', 'Build rapport'],
        metadata: { interactive: true, aiPowered: true, scenarios: 50 },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'chat-002',
        title: 'Sales Conversation Simulator',
        description: 'AI-powered sales training with realistic customer interactions',
        contentTypeId: 697,
        contentType: 'Chatbot',
        category: 'Sales Training',
        difficulty: 'intermediate',
        duration: 90,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-021', name: 'Sales Development Team', avatar: '/api/placeholder/40/40' },
        tags: ['sales', 'conversation', 'training'],
        rating: { average: 4.6, count: 198 },
        enrollment: { enrolled: 1234 },
        status: 'published',
        createdAt: '2024-05-10T13:40:00Z',
        updatedAt: '2024-06-17T11:35:00Z',
        price: { amount: 89.99, currency: 'USD' },
        prerequisites: ['Basic sales knowledge'],
        learningObjectives: ['Perfect sales pitch', 'Handle objections', 'Close deals'],
        metadata: { interactive: true, aiPowered: true, scenarios: 75, analytics: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'chat-003',
        title: 'Technical Support Bot Trainer',
        description: 'Learn to handle technical support queries through AI chatbot simulation',
        contentTypeId: 697,
        contentType: 'Chatbot',
        category: 'Technical Support',
        difficulty: 'intermediate',
        duration: 75,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-027', name: 'Tech Support Team', avatar: '/api/placeholder/40/40' },
        tags: ['technical support', 'troubleshooting', 'chatbot'],
        rating: { average: 4.5, count: 123 },
        enrollment: { enrolled: 789 },
        status: 'published',
        createdAt: '2024-06-02T09:25:00Z',
        updatedAt: '2024-06-18T14:40:00Z',
        prerequisites: ['Basic technical knowledge'],
        learningObjectives: ['Diagnose problems', 'Provide solutions', 'Escalate effectively'],
        metadata: { interactive: true, aiPowered: true, scenarios: 60, knowledgeBase: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },

    // User Guide (698) - 2 items
    {
        id: 'guide-001',
        title: 'Software Platform User Guide',
        description: 'Comprehensive user guide for the company software platform',
        contentTypeId: 698,
        contentType: 'User Guide',
        category: 'Software Training',
        difficulty: 'beginner',
        duration: 90,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-022', name: 'Product Team', avatar: '/api/placeholder/40/40' },
        tags: ['user guide', 'software', 'documentation'],
        rating: { average: 4.3, count: 345 },
        enrollment: { enrolled: 2789 },
        status: 'published',
        createdAt: '2024-05-15T09:25:00Z',
        updatedAt: '2024-06-16T15:40:00Z',
        prerequisites: [],
        learningObjectives: ['Navigate software', 'Use key features', 'Troubleshoot issues'],
        metadata: { searchable: true, stepByStep: true, screenshots: true, version: '3.2' },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'guide-002',
        title: 'API Integration Guide',
        description: 'Step-by-step guide for integrating with our REST API',
        contentTypeId: 698,
        contentType: 'User Guide',
        category: 'Backend Development',
        difficulty: 'intermediate',
        duration: 120,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-003', name: 'Alex Rodriguez', avatar: '/api/placeholder/40/40' },
        tags: ['api', 'integration', 'guide'],
        rating: { average: 4.7, count: 189 },
        enrollment: { enrolled: 1456 },
        status: 'published',
        createdAt: '2024-06-08T14:30:00Z',
        updatedAt: '2024-06-18T11:20:00Z',
        prerequisites: ['API development knowledge'],
        learningObjectives: ['Integrate APIs', 'Handle authentication', 'Error handling'],
        metadata: { searchable: true, codeExamples: true, postman: true, version: '2.0' },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },

    // Role Play (699) - 3 items
    {
        id: 'role-001',
        title: 'Conflict Resolution Scenarios',
        description: 'Practice conflict resolution through interactive role-play scenarios',
        contentTypeId: 699,
        contentType: 'Role Play',
        category: 'Soft Skills',
        difficulty: 'intermediate',
        duration: 120,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-023', name: 'HR Development Team', avatar: '/api/placeholder/40/40' },
        tags: ['conflict resolution', 'role play', 'soft skills'],
        rating: { average: 4.7, count: 189 },
        enrollment: { enrolled: 1456 },
        status: 'published',
        createdAt: '2024-05-20T11:50:00Z',
        updatedAt: '2024-06-15T14:25:00Z',
        price: { amount: 69.99, currency: 'USD' },
        prerequisites: ['Basic communication skills'],
        learningObjectives: ['Resolve conflicts', 'Practice mediation', 'Build relationships'],
        metadata: { interactive: true, scenarios: 25, feedback: true, multiplayer: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'role-002',
        title: 'Leadership Decision Making',
        description: 'Executive leadership scenarios for critical decision making practice',
        contentTypeId: 699,
        contentType: 'Role Play',
        category: 'Leadership',
        difficulty: 'advanced',
        duration: 180,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-013', name: 'Leadership Institute', avatar: '/api/placeholder/40/40' },
        tags: ['leadership', 'decision making', 'executive'],
        rating: { average: 4.8, count: 123 },
        enrollment: { enrolled: 678 },
        status: 'published',
        createdAt: '2024-05-25T15:30:00Z',
        updatedAt: '2024-06-18T16:15:00Z',
        price: { amount: 199.99, currency: 'USD' },
        prerequisites: ['Management experience', 'Leadership basics'],
        learningObjectives: ['Make strategic decisions', 'Handle crises', 'Lead teams'],
        metadata: { interactive: true, scenarios: 15, complexity: 'high', analytics: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'role-003',
        title: 'Negotiation Skills Workshop',
        description: 'Practice negotiation techniques through realistic business scenarios',
        contentTypeId: 699,
        contentType: 'Role Play',
        category: 'Business Skills',
        difficulty: 'intermediate',
        duration: 150,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-028', name: 'Business Training Institute', avatar: '/api/placeholder/40/40' },
        tags: ['negotiation', 'business', 'communication'],
        rating: { average: 4.6, count: 156 },
        enrollment: { enrolled: 892 },
        status: 'published',
        createdAt: '2024-06-12T10:40:00Z',
        updatedAt: '2024-06-18T13:15:00Z',
        price: { amount: 119.99, currency: 'USD' },
        prerequisites: ['Business communication basics'],
        learningObjectives: ['Master negotiation tactics', 'Build win-win solutions', 'Handle difficult situations'],
        metadata: { interactive: true, scenarios: 20, pairWork: true, feedback: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },

    // Flashcards (700) - 4 items
    {
        id: 'flash-001',
        title: 'JavaScript Concepts Flashcards',
        description: 'Interactive flashcards for mastering JavaScript programming concepts',
        contentTypeId: 700,
        contentType: 'Flashcards',
        category: 'Programming',
        difficulty: 'beginner',
        duration: 45,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-001', name: 'Sarah Johnson', avatar: '/api/placeholder/40/40' },
        tags: ['javascript', 'flashcards', 'study'],
        rating: { average: 4.5, count: 456 },
        enrollment: { enrolled: 2345 },
        status: 'published',
        createdAt: '2024-06-01T10:20:00Z',
        updatedAt: '2024-06-18T12:45:00Z',
        prerequisites: [],
        learningObjectives: ['Memorize key concepts', 'Quick review', 'Test knowledge'],
        isPartOfPath: ['path-001'],
        metadata: { cardCount: 150, spaced: true, adaptive: true, mobile: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'flash-002',
        title: 'Medical Terminology Flashcards',
        description: 'Comprehensive flashcard set for medical terminology and definitions',
        contentTypeId: 700,
        contentType: 'Flashcards',
        category: 'Medical Education',
        difficulty: 'intermediate',
        duration: 60,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-016', name: 'Medical Education Team', avatar: '/api/placeholder/40/40' },
        tags: ['medical', 'terminology', 'healthcare'],
        rating: { average: 4.6, count: 289 },
        enrollment: { enrolled: 1678 },
        status: 'published',
        createdAt: '2024-06-05T14:35:00Z',
        updatedAt: '2024-06-17T16:20:00Z',
        price: { amount: 39.99, currency: 'USD' },
        prerequisites: ['Basic medical knowledge'],
        learningObjectives: ['Learn medical terms', 'Understand definitions', 'Build vocabulary'],
        metadata: { cardCount: 500, audio: true, images: true, categories: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'flash-003',
        title: 'Project Management Acronyms',
        description: 'Essential project management acronyms and abbreviations',
        contentTypeId: 700,
        contentType: 'Flashcards',
        category: 'Project Management',
        difficulty: 'beginner',
        duration: 30,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-007', name: 'Robert Taylor', avatar: '/api/placeholder/40/40' },
        tags: ['project management', 'acronyms', 'pmp'],
        rating: { average: 4.4, count: 167 },
        enrollment: { enrolled: 1234 },
        status: 'published',
        createdAt: '2024-06-08T11:10:00Z',
        updatedAt: '2024-06-16T13:55:00Z',
        prerequisites: [],
        learningObjectives: ['Learn PM acronyms', 'Understand terminology', 'PMP exam prep'],
        isPartOfPath: ['path-001'],
        metadata: { cardCount: 100, difficulty: 'adaptive', progress: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'flash-004',
        title: 'Cloud Computing Concepts',
        description: 'Master cloud computing terminology and key concepts',
        contentTypeId: 700,
        contentType: 'Flashcards',
        category: 'Cloud Computing',
        difficulty: 'intermediate',
        duration: 50,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-009', name: 'Mark Wilson', avatar: '/api/placeholder/40/40' },
        tags: ['cloud computing', 'aws', 'concepts'],
        rating: { average: 4.7, count: 234 },
        enrollment: { enrolled: 1567 },
        status: 'published',
        createdAt: '2024-06-14T16:25:00Z',
        updatedAt: '2024-06-18T10:30:00Z',
        price: { amount: 29.99, currency: 'USD' },
        prerequisites: ['Basic IT knowledge'],
        learningObjectives: ['Understand cloud concepts', 'Learn service types', 'Certification prep'],
        metadata: { cardCount: 200, categories: true, progress: true, certPrep: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    }
];