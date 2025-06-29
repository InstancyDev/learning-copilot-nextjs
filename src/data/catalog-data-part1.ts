// src/data/catalog-data-part1.ts
// Catalog data - Part 1 (Learning Modules, Assessments, Learning Paths)

import type { CatalogItem } from '@/types/Catalog';

export const catalogDataPart1: CatalogItem[] = [
    // Learning Modules (8) - 6 items
    {
        id: 'lm-001',
        title: 'JavaScript Fundamentals',
        description: 'Master the core concepts of JavaScript programming language',
        contentTypeId: 8,
        contentType: 'Learning Module',
        category: 'Programming',
        difficulty: 'beginner',
        duration: 120,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-001', name: 'Sarah Johnson', avatar: '/api/placeholder/40/40' },
        tags: ['javascript', 'programming', 'web development'],
        rating: { average: 4.5, count: 248 },
        enrollment: { enrolled: 1250, capacity: 2000 },
        status: 'published',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-06-10T14:30:00Z',
        price: { amount: 29.99, currency: 'USD' },
        prerequisites: ['Basic computer skills'],
        learningObjectives: ['Understand JavaScript syntax', 'Write basic programs', 'Debug JavaScript code'],
        metadata: { estimatedCompletionTime: '2 weeks', certificateAvailable: true },
        pathItems: [], // No path items for this module
        isPartOfPath: [], // Not part of any learning path
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'lm-002',
        title: 'React Component Architecture',
        description: 'Deep dive into React component design patterns and best practices',
        contentTypeId: 8,
        contentType: 'Learning Module',
        category: 'Frontend Development',
        difficulty: 'intermediate',
        duration: 180,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-002', name: 'Michael Chen', avatar: '/api/placeholder/40/40' },
        tags: ['react', 'components', 'architecture'],
        rating: { average: 4.7, count: 156 },
        enrollment: { enrolled: 890 },
        status: 'published',
        createdAt: '2024-02-20T09:00:00Z',
        updatedAt: '2024-06-15T16:45:00Z',
        price: { amount: 49.99, currency: 'USD' },
        prerequisites: ['JavaScript ES6+', 'Basic React knowledge'],
        learningObjectives: ['Design reusable components', 'Implement state management', 'Optimize performance'],
        metadata: { estimatedCompletionTime: '3 weeks', certificateAvailable: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'lm-003',
        title: 'Database Design Principles',
        description: 'Learn relational database design and normalization techniques',
        contentTypeId: 8,
        contentType: 'Learning Module',
        category: 'Database',
        difficulty: 'intermediate',
        duration: 150,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-003', name: 'Alex Rodriguez', avatar: '/api/placeholder/40/40' },
        tags: ['database', 'sql', 'design'],
        rating: { average: 4.6, count: 203 },
        enrollment: { enrolled: 1100 },
        status: 'published',
        createdAt: '2024-03-05T11:30:00Z',
        updatedAt: '2024-06-01T10:15:00Z',
        price: { amount: 39.99, currency: 'USD' },
        prerequisites: ['Basic SQL knowledge'],
        learningObjectives: ['Design normalized databases', 'Create efficient schemas', 'Optimize queries'],
        metadata: { estimatedCompletionTime: '2-3 weeks', certificateAvailable: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'lm-004',
        title: 'Python for Data Science',
        description: 'Essential Python programming skills for data science applications',
        contentTypeId: 8,
        contentType: 'Learning Module',
        category: 'Data Science',
        difficulty: 'beginner',
        duration: 200,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-004', name: 'Dr. Emily Watson', avatar: '/api/placeholder/40/40' },
        tags: ['python', 'data science', 'programming'],
        rating: { average: 4.8, count: 312 },
        enrollment: { enrolled: 1567 },
        status: 'published',
        createdAt: '2024-01-28T14:20:00Z',
        updatedAt: '2024-06-12T09:45:00Z',
        price: { amount: 59.99, currency: 'USD' },
        prerequisites: ['Basic programming concepts'],
        learningObjectives: ['Master Python syntax', 'Work with data structures', 'Use scientific libraries'],
        metadata: { estimatedCompletionTime: '4 weeks', certificateAvailable: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'lm-005',
        title: 'Cloud Architecture Fundamentals',
        description: 'Learn the principles of designing scalable cloud architectures',
        contentTypeId: 8,
        contentType: 'Learning Module',
        category: 'Cloud Computing',
        difficulty: 'intermediate',
        duration: 240,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-009', name: 'Mark Wilson', avatar: '/api/placeholder/40/40' },
        tags: ['cloud', 'architecture', 'scalability'],
        rating: { average: 4.7, count: 189 },
        enrollment: { enrolled: 934 },
        status: 'published',
        createdAt: '2024-03-08T11:15:00Z',
        updatedAt: '2024-06-14T16:30:00Z',
        price: { amount: 79.99, currency: 'USD' },
        prerequisites: ['Basic cloud knowledge', 'System design concepts'],
        learningObjectives: ['Design cloud solutions', 'Implement best practices', 'Optimize costs'],
        metadata: { estimatedCompletionTime: '5 weeks', certificateAvailable: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'lm-006',
        title: 'Cybersecurity Risk Management',
        description: 'Comprehensive approach to identifying and managing cybersecurity risks',
        contentTypeId: 8,
        contentType: 'Learning Module',
        category: 'Security',
        difficulty: 'advanced',
        duration: 300,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-005', name: 'David Kim', avatar: '/api/placeholder/40/40' },
        tags: ['cybersecurity', 'risk management', 'compliance'],
        rating: { average: 4.9, count: 145 },
        enrollment: { enrolled: 567 },
        status: 'published',
        createdAt: '2024-04-02T13:30:00Z',
        updatedAt: '2024-06-18T10:20:00Z',
        price: { amount: 149.99, currency: 'USD' },
        prerequisites: ['Security fundamentals', 'Risk assessment basics'],
        learningObjectives: ['Assess security risks', 'Develop mitigation strategies', 'Ensure compliance'],
        metadata: { estimatedCompletionTime: '6 weeks', certificateAvailable: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },

    // Assessments (9) - 4 items
    {
        id: 'assess-001',
        title: 'JavaScript Competency Test',
        description: 'Comprehensive assessment of JavaScript programming skills',
        contentTypeId: 9,
        contentType: 'Assessment',
        category: 'Programming',
        difficulty: 'intermediate',
        duration: 90,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-001', name: 'Sarah Johnson', avatar: '/api/placeholder/40/40' },
        tags: ['javascript', 'assessment', 'certification'],
        rating: { average: 4.3, count: 89 },
        enrollment: { enrolled: 567 },
        status: 'published',
        createdAt: '2024-04-01T14:00:00Z',
        updatedAt: '2024-06-08T09:30:00Z',
        prerequisites: ['JavaScript fundamentals'],
        learningObjectives: ['Validate JS knowledge', 'Identify skill gaps', 'Earn certification'],
        metadata: { passingScore: 80, attempts: 3, certificateAvailable: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'assess-002',
        title: 'Cloud Security Assessment',
        description: 'Test your knowledge of cloud security best practices and compliance',
        contentTypeId: 9,
        contentType: 'Assessment',
        category: 'Security',
        difficulty: 'advanced',
        duration: 120,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-004', name: 'Dr. Emily Watson', avatar: '/api/placeholder/40/40' },
        tags: ['cloud security', 'compliance', 'assessment'],
        rating: { average: 4.5, count: 134 },
        enrollment: { enrolled: 432 },
        status: 'published',
        createdAt: '2024-03-15T10:00:00Z',
        updatedAt: '2024-06-12T15:20:00Z',
        prerequisites: ['Cloud computing basics', 'Security fundamentals'],
        learningObjectives: ['Assess security knowledge', 'Validate compliance understanding', 'Identify training needs'],
        metadata: { passingScore: 85, attempts: 2, certificateAvailable: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'assess-003',
        title: 'Data Analysis Skills Evaluation',
        description: 'Comprehensive assessment of data analysis and visualization skills',
        contentTypeId: 9,
        contentType: 'Assessment',
        category: 'Data Science',
        difficulty: 'intermediate',
        duration: 100,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-004', name: 'Dr. Emily Watson', avatar: '/api/placeholder/40/40' },
        tags: ['data analysis', 'statistics', 'visualization'],
        rating: { average: 4.6, count: 178 },
        enrollment: { enrolled: 789 },
        status: 'published',
        createdAt: '2024-04-12T16:25:00Z',
        updatedAt: '2024-06-16T14:15:00Z',
        prerequisites: ['Statistics basics', 'Excel or Python knowledge'],
        learningObjectives: ['Evaluate analytical skills', 'Test visualization abilities', 'Assess statistical knowledge'],
        metadata: { passingScore: 75, attempts: 3, certificateAvailable: true },
        viewType: 2, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'assess-004',
        title: 'Project Management Professional Quiz',
        description: 'Practice assessment for PMP certification preparation',
        contentTypeId: 9,
        contentType: 'Assessment',
        category: 'Project Management',
        difficulty: 'advanced',
        duration: 180,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-007', name: 'Robert Taylor', avatar: '/api/placeholder/40/40' },
        tags: ['pmp', 'project management', 'certification'],
        rating: { average: 4.8, count: 256 },
        enrollment: { enrolled: 1234 },
        status: 'published',
        createdAt: '2024-03-20T12:40:00Z',
        updatedAt: '2024-06-10T11:55:00Z',
        prerequisites: ['Project management experience', 'PMI methodology knowledge'],
        learningObjectives: ['Practice PMP questions', 'Identify weak areas', 'Build exam confidence'],
        metadata: { passingScore: 80, attempts: 5, certificateAvailable: false },
        viewType: 2, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },

    // Learning Paths (10) - 3 items
    {
        id: 'path-001',
        title: 'Full Stack Developer Journey',
        description: 'Complete learning path from beginner to full stack developer',
        contentTypeId: 10,
        contentType: 'Learning Path',
        category: 'Programming',
        difficulty: 'beginner',
        duration: 1200,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-001', name: 'Sarah Johnson', avatar: '/api/placeholder/40/40' },
        tags: ['full stack', 'web development', 'career path'],
        rating: { average: 4.8, count: 342 },
        enrollment: { enrolled: 2100 },
        status: 'published',
        createdAt: '2024-01-10T08:00:00Z',
        updatedAt: '2024-05-20T13:20:00Z',
        price: { amount: 199.99, currency: 'USD' },
        prerequisites: ['Basic computer skills'],
        learningObjectives: ['Master frontend and backend', 'Build complete applications', 'Deploy to production'],
        pathItems: ['lm-001', 'lm-002', 'vid-001', 'course-001', 'assess-001', 'assign-001', 'flash-001'],
        metadata: { estimatedCompletionTime: '6 months', certificateAvailable: true, pathType: 'sequential' },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'path-002',
        title: 'Data Science Mastery',
        description: 'Comprehensive path covering statistics, machine learning, and data visualization',
        contentTypeId: 10,
        contentType: 'Learning Path',
        category: 'Data Science',
        difficulty: 'intermediate',
        duration: 1800,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-004', name: 'Dr. Emily Watson', avatar: '/api/placeholder/40/40' },
        tags: ['data science', 'machine learning', 'analytics'],
        rating: { average: 4.9, count: 189 },
        enrollment: { enrolled: 1580 },
        status: 'published',
        createdAt: '2024-02-01T09:00:00Z',
        updatedAt: '2024-06-18T11:45:00Z',
        price: { amount: 299.99, currency: 'USD' },
        prerequisites: ['Statistics knowledge', 'Python programming'],
        learningObjectives: ['Master ML algorithms', 'Create data visualizations', 'Build predictive models'],
        pathItems: ['lm-004', 'vid-002', 'course-003', 'doc-002', 'assess-003', 'assign-002'],
        metadata: { estimatedCompletionTime: '8 months', certificateAvailable: true, pathType: 'flexible' },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'path-003',
        title: 'Cybersecurity Professional Track',
        description: 'Complete cybersecurity learning track from fundamentals to advanced topics',
        contentTypeId: 10,
        contentType: 'Learning Path',
        category: 'Security',
        difficulty: 'intermediate',
        duration: 2400,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-005', name: 'David Kim', avatar: '/api/placeholder/40/40' },
        tags: ['cybersecurity', 'security', 'certification'],
        rating: { average: 4.9, count: 234 },
        enrollment: { enrolled: 1123 },
        status: 'published',
        createdAt: '2024-02-15T11:30:00Z',
        updatedAt: '2024-06-17T14:45:00Z',
        price: { amount: 399.99, currency: 'USD' },
        prerequisites: ['Basic IT knowledge'],
        learningObjectives: ['Master security concepts', 'Implement protection measures', 'Achieve certifications'],
        pathItems: ['lm-006', 'vid-003', 'assess-002', 'aicc-001', 'xapi-001'],
        metadata: { estimatedCompletionTime: '10 months', certificateAvailable: true, pathType: 'sequential' },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    }
];