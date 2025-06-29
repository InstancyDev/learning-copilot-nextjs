// src/data/catalog-data-part3.ts
// Catalog data - Part 3 (Specialized Content Types: AICC, Reference, Webpage, Certificate, Event, xAPI, Physical Product)

import type { CatalogItem } from '@/types/Catalog';

export const catalogDataPart3: CatalogItem[] = [
    // AICC (27) - 2 items
    {
        id: 'aicc-001',
        title: 'Safety Training Module',
        description: 'Workplace safety training compliant with OSHA standards',
        contentTypeId: 27,
        contentType: 'AICC',
        category: 'Safety',
        difficulty: 'beginner',
        duration: 90,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-010', name: 'Safety Team', avatar: '/api/placeholder/40/40' },
        tags: ['safety', 'compliance', 'workplace'],
        rating: { average: 4.3, count: 789 },
        enrollment: { enrolled: 4567 },
        status: 'published',
        createdAt: '2024-01-20T12:15:00Z',
        updatedAt: '2024-06-09T11:30:00Z',
        prerequisites: [],
        learningObjectives: ['Follow safety protocols', 'Identify hazards', 'Report incidents'],
        isPartOfPath: ['path-003'],
        metadata: { aiccCompliant: true, trackingEnabled: true, mandatory: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'aicc-002',
        title: 'Compliance Training for Financial Services',
        description: 'Essential compliance training for financial industry professionals',
        contentTypeId: 27,
        contentType: 'AICC',
        category: 'Compliance',
        difficulty: 'intermediate',
        duration: 120,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-024', name: 'Compliance Team', avatar: '/api/placeholder/40/40' },
        tags: ['compliance', 'financial', 'regulations'],
        rating: { average: 4.5, count: 345 },
        enrollment: { enrolled: 2134 },
        status: 'published',
        createdAt: '2024-03-25T13:45:00Z',
        updatedAt: '2024-06-15T15:20:00Z',
        prerequisites: ['Financial industry knowledge'],
        learningObjectives: ['Understand regulations', 'Ensure compliance', 'Avoid penalties'],
        metadata: { aiccCompliant: true, trackingEnabled: true, mandatory: true, expires: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },

    // Reference (28) - 2 items
    {
        id: 'ref-001',
        title: 'SQL Command Reference',
        description: 'Quick reference guide for SQL commands and syntax',
        contentTypeId: 28,
        contentType: 'Reference',
        category: 'Database',
        difficulty: 'intermediate',
        duration: 15,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-003', name: 'Alex Rodriguez', avatar: '/api/placeholder/40/40' },
        tags: ['sql', 'reference', 'database'],
        rating: { average: 4.5, count: 234 },
        enrollment: { enrolled: 3456 },
        status: 'published',
        createdAt: '2024-03-05T16:40:00Z',
        updatedAt: '2024-06-12T14:55:00Z',
        prerequisites: ['Basic SQL knowledge'],
        learningObjectives: ['Quick command lookup', 'Syntax reference', 'Best practices'],
        metadata: { searchable: true, printable: true, bookmarkable: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'ref-002',
        title: 'React Hooks Reference',
        description: 'Comprehensive reference for React Hooks and their usage',
        contentTypeId: 28,
        contentType: 'Reference',
        category: 'Frontend Development',
        difficulty: 'intermediate',
        duration: 20,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-002', name: 'Michael Chen', avatar: '/api/placeholder/40/40' },
        tags: ['react', 'hooks', 'reference'],
        rating: { average: 4.7, count: 189 },
        enrollment: { enrolled: 2789 },
        status: 'published',
        createdAt: '2024-04-15T10:25:00Z',
        updatedAt: '2024-06-17T12:40:00Z',
        prerequisites: ['React basics'],
        learningObjectives: ['Hook quick reference', 'Usage patterns', 'Best practices'],
        metadata: { searchable: true, printable: true, bookmarkable: true, codeExamples: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },

    // Webpage (36) - 2 items
    {
        id: 'web-001',
        title: 'Company Coding Standards',
        description: 'Official coding standards and best practices documentation',
        contentTypeId: 36,
        contentType: 'Webpage',
        category: 'Development Standards',
        difficulty: 'intermediate',
        duration: 45,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-011', name: 'Tech Lead Team', avatar: '/api/placeholder/40/40' },
        tags: ['coding standards', 'best practices', 'documentation'],
        rating: { average: 4.2, count: 156 },
        enrollment: { enrolled: 2345 },
        status: 'published',
        createdAt: '2024-04-01T10:20:00Z',
        updatedAt: '2024-06-18T12:10:00Z',
        prerequisites: ['Programming experience'],
        learningObjectives: ['Follow coding standards', 'Write clean code', 'Maintain consistency'],
        metadata: { interactive: false, printable: true, version: '2.1' },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'web-002',
        title: 'API Documentation Portal',
        description: 'Interactive API documentation with examples and testing tools',
        contentTypeId: 36,
        contentType: 'Webpage',
        category: 'Backend Development',
        difficulty: 'intermediate',
        duration: 60,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-003', name: 'Alex Rodriguez', avatar: '/api/placeholder/40/40' },
        tags: ['api', 'documentation', 'testing'],
        rating: { average: 4.6, count: 234 },
        enrollment: { enrolled: 1890 },
        status: 'published',
        createdAt: '2024-05-12T14:30:00Z',
        updatedAt: '2024-06-16T16:45:00Z',
        prerequisites: ['API development knowledge'],
        learningObjectives: ['Understand API endpoints', 'Test API calls', 'Integration examples'],
        metadata: { interactive: true, testingTools: true, swagger: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },

    // Certificate (52) - 2 items
    {
        id: 'cert-001',
        title: 'JavaScript Developer Certificate',
        description: 'Official certificate for JavaScript development proficiency',
        contentTypeId: 52,
        contentType: 'Certificate',
        category: 'Programming',
        difficulty: 'intermediate',
        duration: 0,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-001', name: 'Sarah Johnson', avatar: '/api/placeholder/40/40' },
        tags: ['certificate', 'javascript', 'achievement'],
        rating: { average: 4.8, count: 89 },
        enrollment: { enrolled: 456 },
        status: 'published',
        createdAt: '2024-05-01T09:00:00Z',
        updatedAt: '2024-06-15T10:30:00Z',
        prerequisites: ['Complete JavaScript learning path'],
        learningObjectives: ['Validate skills', 'Showcase achievement', 'Career advancement'],
        metadata: { digital: true, verifiable: true, expires: false },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'cert-002',
        title: 'Data Science Professional Certificate',
        description: 'Advanced certificate for data science and machine learning expertise',
        contentTypeId: 52,
        contentType: 'Certificate',
        category: 'Data Science',
        difficulty: 'advanced',
        duration: 0,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-004', name: 'Dr. Emily Watson', avatar: '/api/placeholder/40/40' },
        tags: ['certificate', 'data science', 'ml'],
        rating: { average: 4.9, count: 67 },
        enrollment: { enrolled: 234 },
        status: 'published',
        createdAt: '2024-05-15T11:20:00Z',
        updatedAt: '2024-06-17T14:50:00Z',
        prerequisites: ['Complete Data Science learning path', 'Portfolio project'],
        learningObjectives: ['Validate expertise', 'Professional recognition', 'Career advancement'],
        metadata: { digital: true, verifiable: true, expires: false, portfolioRequired: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },

    // Event (70) - 3 items
    {
        id: 'event-001',
        title: 'Tech Conference 2024',
        description: 'Annual technology conference featuring industry leaders',
        contentTypeId: 70,
        contentType: 'Event',
        category: 'Technology',
        difficulty: 'intermediate',
        duration: 480,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-012', name: 'Event Team', avatar: '/api/placeholder/40/40' },
        tags: ['conference', 'networking', 'technology'],
        rating: { average: 4.9, count: 234 },
        enrollment: { enrolled: 1234, capacity: 2000 },
        status: 'published',
        createdAt: '2024-04-15T14:30:00Z',
        updatedAt: '2024-06-10T16:45:00Z',
        price: { amount: 299.99, currency: 'USD' },
        prerequisites: [],
        learningObjectives: ['Network with peers', 'Learn industry trends', 'Gain insights'],
        metadata: { live: true, recorded: true, eventDate: '2024-08-15', location: 'San Francisco' },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'event-002',
        title: 'Data Science Symposium',
        description: 'Deep dive into latest data science research and applications',
        contentTypeId: 70,
        contentType: 'Event',
        category: 'Data Science',
        difficulty: 'advanced',
        duration: 360,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-004', name: 'Dr. Emily Watson', avatar: '/api/placeholder/40/40' },
        tags: ['data science', 'research', 'symposium'],
        rating: { average: 4.8, count: 145 },
        enrollment: { enrolled: 567, capacity: 800 },
        status: 'published',
        createdAt: '2024-05-20T10:15:00Z',
        updatedAt: '2024-06-14T13:25:00Z',
        price: { amount: 199.99, currency: 'USD' },
        prerequisites: ['Data science experience'],
        learningObjectives: ['Latest research', 'Advanced techniques', 'Expert networking'],
        metadata: { live: true, recorded: true, eventDate: '2024-09-12', location: 'Virtual' },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'event-003',
        title: 'Leadership Development Workshop',
        description: 'Interactive workshop for developing leadership skills',
        contentTypeId: 70,
        contentType: 'Event',
        category: 'Leadership',
        difficulty: 'intermediate',
        duration: 240,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-013', name: 'Leadership Institute', avatar: '/api/placeholder/40/40' },
        tags: ['leadership', 'workshop', 'development'],
        rating: { average: 4.7, count: 89 },
        enrollment: { enrolled: 156, capacity: 200 },
        status: 'published',
        createdAt: '2024-06-01T12:40:00Z',
        updatedAt: '2024-06-18T15:30:00Z',
        price: { amount: 149.99, currency: 'USD' },
        prerequisites: ['Management experience'],
        learningObjectives: ['Develop leadership skills', 'Practice techniques', 'Build confidence'],
        metadata: { live: true, recorded: false, eventDate: '2024-07-25', location: 'Chicago' },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },

    // xAPI (102) - 2 items
    {
        id: 'xapi-001',
        title: 'Leadership Skills Assessment',
        description: 'Comprehensive leadership skills evaluation using xAPI tracking',
        contentTypeId: 102,
        contentType: 'xAPI',
        category: 'Leadership',
        difficulty: 'advanced',
        duration: 120,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-013', name: 'Leadership Institute', avatar: '/api/placeholder/40/40' },
        tags: ['leadership', 'assessment', 'xapi'],
        rating: { average: 4.6, count: 123 },
        enrollment: { enrolled: 678 },
        status: 'published',
        createdAt: '2024-03-20T11:15:00Z',
        updatedAt: '2024-06-14T13:40:00Z',
        price: { amount: 79.99, currency: 'USD' },
        prerequisites: ['Management experience'],
        learningObjectives: ['Assess leadership skills', 'Identify development areas', 'Track progress'],
        isPartOfPath: ['path-003'],
        metadata: { xapiCompliant: true, detailedTracking: true, analytics: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'xapi-002',
        title: 'Sales Performance Analytics',
        description: 'Advanced sales performance tracking and analytics using xAPI',
        contentTypeId: 102,
        contentType: 'xAPI',
        category: 'Sales Training',
        difficulty: 'intermediate',
        duration: 90,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-021', name: 'Sales Development Team', avatar: '/api/placeholder/40/40' },
        tags: ['sales', 'analytics', 'performance'],
        rating: { average: 4.7, count: 156 },
        enrollment: { enrolled: 892 },
        status: 'published',
        createdAt: '2024-04-28T14:50:00Z',
        updatedAt: '2024-06-16T11:15:00Z',
        price: { amount: 99.99, currency: 'USD' },
        prerequisites: ['Sales experience'],
        learningObjectives: ['Track performance', 'Analyze results', 'Improve outcomes'],
        metadata: { xapiCompliant: true, detailedTracking: true, analytics: true, dashboards: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },

    // Physical Product (689) - 2 items
    {
        id: 'phys-001',
        title: 'Arduino Starter Kit',
        description: 'Complete Arduino starter kit with components and guidebook',
        contentTypeId: 689,
        contentType: 'Physical Product',
        category: 'Electronics',
        difficulty: 'beginner',
        duration: 0,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-014', name: 'Electronics Lab', avatar: '/api/placeholder/40/40' },
        tags: ['arduino', 'electronics', 'hardware'],
        rating: { average: 4.7, count: 178 },
        enrollment: { enrolled: 456 },
        status: 'published',
        createdAt: '2024-02-10T13:25:00Z',
        updatedAt: '2024-06-08T15:50:00Z',
        price: { amount: 79.99, currency: 'USD' },
        prerequisites: [],
        learningObjectives: ['Learn electronics basics', 'Build projects', 'Understand programming'],
        metadata: { shipping: true, inventory: 250, weight: '1.2kg' },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'phys-002',
        title: 'Data Science Toolkit',
        description: 'Physical toolkit with reference cards and statistical tables',
        contentTypeId: 689,
        contentType: 'Physical Product',
        category: 'Data Science',
        difficulty: 'intermediate',
        duration: 0,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-004', name: 'Dr. Emily Watson', avatar: '/api/placeholder/40/40' },
        tags: ['data science', 'reference', 'toolkit'],
        rating: { average: 4.5, count: 123 },
        enrollment: { enrolled: 234 },
        status: 'published',
        createdAt: '2024-05-05T11:30:00Z',
        updatedAt: '2024-06-15T14:20:00Z',
        price: { amount: 49.99, currency: 'USD' },
        prerequisites: ['Basic statistics knowledge'],
        learningObjectives: ['Quick reference', 'Offline resources', 'Practical tools'],
        metadata: { shipping: true, inventory: 150, weight: '0.8kg' },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    }
];