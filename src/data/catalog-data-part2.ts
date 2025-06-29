// src/data/catalog-data-part2.ts
// Catalog data - Part 2 (Videos, Documents, Glossary, HTML Package, eLearning Courses)

import type { CatalogItem } from '@/types/Catalog';

export const catalogDataPart2: CatalogItem[] = [
    // Videos and Audio (11) - 5 items
    {
        id: 'vid-001',
        title: 'API Design Best Practices',
        description: 'Learn how to design robust and scalable REST APIs',
        contentTypeId: 11,
        contentType: 'Video and Audio',
        category: 'Backend Development',
        difficulty: 'advanced',
        duration: 45,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-003', name: 'Alex Rodriguez', avatar: '/api/placeholder/40/40' },
        tags: ['api', 'rest', 'backend', 'design'],
        rating: { average: 4.7, count: 298 },
        enrollment: { enrolled: 1890 },
        status: 'published',
        createdAt: '2024-03-10T14:30:00Z',
        updatedAt: '2024-06-05T16:15:00Z',
        prerequisites: ['HTTP protocol knowledge'],
        learningObjectives: ['Design RESTful APIs', 'Implement versioning', 'Handle authentication'],
        isPartOfPath: ['path-001'],
        metadata: { videoQuality: '4K', subtitles: true, downloadable: false },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'vid-002',
        title: 'Machine Learning Explained',
        description: 'Introduction to machine learning concepts and algorithms',
        contentTypeId: 11,
        contentType: 'Video and Audio',
        category: 'Data Science',
        difficulty: 'beginner',
        duration: 60,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-004', name: 'Dr. Emily Watson', avatar: '/api/placeholder/40/40' },
        tags: ['machine learning', 'ai', 'algorithms'],
        rating: { average: 4.6, count: 445 },
        enrollment: { enrolled: 2350 },
        status: 'published',
        createdAt: '2024-01-25T11:00:00Z',
        updatedAt: '2024-06-03T14:20:00Z',
        prerequisites: ['Basic mathematics'],
        learningObjectives: ['Understand ML concepts', 'Identify use cases', 'Choose appropriate algorithms'],
        isPartOfPath: ['path-002'],
        metadata: { videoQuality: 'HD', subtitles: true, downloadable: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'vid-003',
        title: 'Cybersecurity Fundamentals',
        description: 'Essential cybersecurity concepts for IT professionals',
        contentTypeId: 11,
        contentType: 'Video and Audio',
        category: 'Security',
        difficulty: 'intermediate',
        duration: 75,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-005', name: 'David Kim', avatar: '/api/placeholder/40/40' },
        tags: ['cybersecurity', 'security', 'threats'],
        rating: { average: 4.8, count: 223 },
        enrollment: { enrolled: 1456 },
        status: 'published',
        createdAt: '2024-02-14T13:45:00Z',
        updatedAt: '2024-06-07T10:30:00Z',
        prerequisites: ['Basic IT knowledge'],
        learningObjectives: ['Identify security threats', 'Implement protection measures', 'Respond to incidents'],
        isPartOfPath: ['path-003'],
        metadata: { videoQuality: '4K', subtitles: true, downloadable: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'vid-004',
        title: 'Leadership Communication Skills',
        description: 'Effective communication strategies for leaders and managers',
        contentTypeId: 11,
        contentType: 'Video and Audio',
        category: 'Leadership',
        difficulty: 'intermediate',
        duration: 90,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-013', name: 'Leadership Institute', avatar: '/api/placeholder/40/40' },
        tags: ['leadership', 'communication', 'management'],
        rating: { average: 4.7, count: 312 },
        enrollment: { enrolled: 1789 },
        status: 'published',
        createdAt: '2024-03-22T15:20:00Z',
        updatedAt: '2024-06-11T12:40:00Z',
        price: { amount: 49.99, currency: 'USD' },
        prerequisites: ['Basic management experience'],
        learningObjectives: ['Improve communication skills', 'Lead effective meetings', 'Handle difficult conversations'],
        metadata: { videoQuality: 'HD', subtitles: true, downloadable: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'vid-005',
        title: 'Digital Marketing Trends 2024',
        description: 'Latest trends and strategies in digital marketing',
        contentTypeId: 11,
        contentType: 'Video and Audio',
        category: 'Marketing',
        difficulty: 'beginner',
        duration: 55,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-008', name: 'Jennifer Park', avatar: '/api/placeholder/40/40' },
        tags: ['digital marketing', 'trends', 'strategy'],
        rating: { average: 4.5, count: 189 },
        enrollment: { enrolled: 2234 },
        status: 'published',
        createdAt: '2024-04-18T10:15:00Z',
        updatedAt: '2024-06-14T16:30:00Z',
        prerequisites: ['Basic marketing knowledge'],
        learningObjectives: ['Understand current trends', 'Apply new strategies', 'Measure effectiveness'],
        metadata: { videoQuality: 'HD', subtitles: true, downloadable: false },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },

    // Documents (14) - 4 items
    {
        id: 'doc-001',
        title: 'Python Programming Guide',
        description: 'Comprehensive guide to Python programming for beginners',
        contentTypeId: 14,
        contentType: 'Documents',
        category: 'Programming',
        difficulty: 'beginner',
        duration: 180,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-006', name: 'Lisa Chen', avatar: '/api/placeholder/40/40' },
        tags: ['python', 'programming', 'guide'],
        rating: { average: 4.4, count: 567 },
        enrollment: { enrolled: 3200 },
        status: 'published',
        createdAt: '2024-01-08T09:15:00Z',
        updatedAt: '2024-05-28T12:40:00Z',
        prerequisites: ['Basic computer skills'],
        learningObjectives: ['Learn Python syntax', 'Write Python programs', 'Use Python libraries'],
        metadata: { pages: 150, downloadable: true, printable: true, format: 'PDF' },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'doc-002',
        title: 'Data Analysis with Pandas',
        description: 'Complete reference for data manipulation using Pandas library',
        contentTypeId: 14,
        contentType: 'Documents',
        category: 'Data Science',
        difficulty: 'intermediate',
        duration: 240,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-004', name: 'Dr. Emily Watson', avatar: '/api/placeholder/40/40' },
        tags: ['pandas', 'data analysis', 'python'],
        rating: { average: 4.7, count: 289 },
        enrollment: { enrolled: 1867 },
        status: 'published',
        createdAt: '2024-02-22T15:20:00Z',
        updatedAt: '2024-06-10T09:55:00Z',
        prerequisites: ['Python basics', 'Statistics fundamentals'],
        learningObjectives: ['Master Pandas operations', 'Perform data cleaning', 'Create data visualizations'],
        isPartOfPath: ['path-002'],
        metadata: { pages: 200, downloadable: true, printable: true, format: 'PDF' },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'doc-003',
        title: 'Cloud Security Handbook',
        description: 'Comprehensive handbook for cloud security best practices',
        contentTypeId: 14,
        contentType: 'Documents',
        category: 'Security',
        difficulty: 'advanced',
        duration: 300,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-005', name: 'David Kim', avatar: '/api/placeholder/40/40' },
        tags: ['cloud security', 'handbook', 'best practices'],
        rating: { average: 4.8, count: 178 },
        enrollment: { enrolled: 892 },
        status: 'published',
        createdAt: '2024-03-12T14:30:00Z',
        updatedAt: '2024-06-16T11:25:00Z',
        price: { amount: 59.99, currency: 'USD' },
        prerequisites: ['Cloud fundamentals', 'Security basics'],
        learningObjectives: ['Implement cloud security', 'Follow compliance standards', 'Mitigate risks'],
        metadata: { pages: 250, downloadable: true, printable: true, format: 'PDF' },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'doc-004',
        title: 'Project Management Templates',
        description: 'Collection of project management templates and checklists',
        contentTypeId: 14,
        contentType: 'Documents',
        category: 'Project Management',
        difficulty: 'intermediate',
        duration: 60,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-007', name: 'Robert Taylor', avatar: '/api/placeholder/40/40' },
        tags: ['project management', 'templates', 'tools'],
        rating: { average: 4.6, count: 445 },
        enrollment: { enrolled: 2567 },
        status: 'published',
        createdAt: '2024-04-05T11:45:00Z',
        updatedAt: '2024-06-18T14:20:00Z',
        price: { amount: 29.99, currency: 'USD' },
        prerequisites: ['Basic project management knowledge'],
        learningObjectives: ['Use PM templates', 'Follow best practices', 'Improve efficiency'],
        metadata: { pages: 75, downloadable: true, printable: true, format: 'PDF', templates: 25 },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },

    // Glossary (20) - 2 items
    {
        id: 'glos-001',
        title: 'Web Development Glossary',
        description: 'Comprehensive glossary of web development terms and concepts',
        contentTypeId: 20,
        contentType: 'Glossary',
        category: 'Web Development',
        difficulty: 'beginner',
        duration: 30,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-001', name: 'Sarah Johnson', avatar: '/api/placeholder/40/40' },
        tags: ['glossary', 'web development', 'reference'],
        rating: { average: 4.2, count: 145 },
        enrollment: { enrolled: 2890 },
        status: 'published',
        createdAt: '2024-03-01T10:30:00Z',
        updatedAt: '2024-06-15T14:15:00Z',
        prerequisites: [],
        learningObjectives: ['Understand web terminology', 'Reference key concepts', 'Build vocabulary'],
        metadata: { entries: 500, searchable: true, interactive: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'glos-002',
        title: 'Data Science Terminology',
        description: 'Essential data science and machine learning terminology guide',
        contentTypeId: 20,
        contentType: 'Glossary',
        category: 'Data Science',
        difficulty: 'intermediate',
        duration: 45,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-004', name: 'Dr. Emily Watson', avatar: '/api/placeholder/40/40' },
        tags: ['data science', 'terminology', 'ml'],
        rating: { average: 4.5, count: 234 },
        enrollment: { enrolled: 1567 },
        status: 'published',
        createdAt: '2024-04-08T13:20:00Z',
        updatedAt: '2024-06-12T16:45:00Z',
        prerequisites: ['Basic data science knowledge'],
        learningObjectives: ['Learn DS terminology', 'Understand ML concepts', 'Build technical vocabulary'],
        metadata: { entries: 300, searchable: true, interactive: true, categories: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },

    // HTML Package (21) - 2 items
    {
        id: 'html-001',
        title: 'Interactive CSS Grid Tutorial',
        description: 'Hands-on tutorial for mastering CSS Grid layout system',
        contentTypeId: 21,
        contentType: 'HTML Package',
        category: 'Frontend Development',
        difficulty: 'intermediate',
        duration: 120,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-002', name: 'Michael Chen', avatar: '/api/placeholder/40/40' },
        tags: ['css grid', 'layout', 'interactive'],
        rating: { average: 4.6, count: 178 },
        enrollment: { enrolled: 1234 },
        status: 'published',
        createdAt: '2024-03-18T11:45:00Z',
        updatedAt: '2024-06-08T16:30:00Z',
        prerequisites: ['CSS basics', 'HTML knowledge'],
        learningObjectives: ['Master CSS Grid', 'Create responsive layouts', 'Build complex designs'],
        metadata: { interactive: true, offline: true, responsive: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'html-002',
        title: 'JavaScript DOM Manipulation Lab',
        description: 'Interactive exercises for learning DOM manipulation with JavaScript',
        contentTypeId: 21,
        contentType: 'HTML Package',
        category: 'Programming',
        difficulty: 'beginner',
        duration: 90,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-001', name: 'Sarah Johnson', avatar: '/api/placeholder/40/40' },
        tags: ['javascript', 'dom', 'interactive'],
        rating: { average: 4.4, count: 267 },
        enrollment: { enrolled: 1789 },
        status: 'published',
        createdAt: '2024-04-22T14:15:00Z',
        updatedAt: '2024-06-14T10:20:00Z',
        prerequisites: ['JavaScript basics', 'HTML/CSS knowledge'],
        learningObjectives: ['Manipulate DOM elements', 'Handle events', 'Create dynamic content'],
        metadata: { interactive: true, offline: true, exercises: 15 },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },

    // eLearning Course (26) - 4 items
    {
        id: 'course-001',
        title: 'Project Management Professional (PMP)',
        description: 'Complete PMP certification preparation course',
        contentTypeId: 26,
        contentType: 'eLearning Course',
        category: 'Project Management',
        difficulty: 'advanced',
        duration: 2400,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-007', name: 'Robert Taylor', avatar: '/api/placeholder/40/40' },
        tags: ['pmp', 'project management', 'certification'],
        rating: { average: 4.9, count: 412 },
        enrollment: { enrolled: 1567, capacity: 2000 },
        status: 'published',
        createdAt: '2024-01-12T08:30:00Z',
        updatedAt: '2024-06-14T13:50:00Z',
        price: { amount: 399.99, currency: 'USD' },
        prerequisites: ['3 years project management experience'],
        learningObjectives: ['Pass PMP exam', 'Master PMI methodology', 'Lead complex projects'],
        isPartOfPath: ['path-001'],
        metadata: { scormCompliant: true, trackingEnabled: true, certificateAvailable: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'course-002',
        title: 'Digital Marketing Fundamentals',
        description: 'Comprehensive course covering all aspects of digital marketing',
        contentTypeId: 26,
        contentType: 'eLearning Course',
        category: 'Marketing',
        difficulty: 'beginner',
        duration: 480,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-008', name: 'Jennifer Park', avatar: '/api/placeholder/40/40' },
        tags: ['digital marketing', 'seo', 'social media'],
        rating: { average: 4.5, count: 623 },
        enrollment: { enrolled: 2890 },
        status: 'published',
        createdAt: '2024-02-05T14:20:00Z',
        updatedAt: '2024-06-11T10:45:00Z',
        price: { amount: 149.99, currency: 'USD' },
        prerequisites: ['Basic business knowledge'],
        learningObjectives: ['Create marketing campaigns', 'Understand analytics', 'Build brand presence'],
        metadata: { scormCompliant: true, trackingEnabled: true, certificateAvailable: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'course-003',
        title: 'AWS Cloud Practitioner',
        description: 'Prepare for AWS Cloud Practitioner certification',
        contentTypeId: 26,
        contentType: 'eLearning Course',
        category: 'Cloud Computing',
        difficulty: 'intermediate',
        duration: 600,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-009', name: 'Mark Wilson', avatar: '/api/placeholder/40/40' },
        tags: ['aws', 'cloud', 'certification'],
        rating: { average: 4.7, count: 334 },
        enrollment: { enrolled: 1789 },
        status: 'published',
        createdAt: '2024-02-28T09:10:00Z',
        updatedAt: '2024-06-16T15:25:00Z',
        price: { amount: 199.99, currency: 'USD' },
        prerequisites: ['Basic IT knowledge'],
        learningObjectives: ['Understand AWS services', 'Pass certification exam', 'Implement cloud solutions'],
        isPartOfPath: ['path-002'],
        metadata: { scormCompliant: true, trackingEnabled: true, certificateAvailable: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    },
    {
        id: 'course-004',
        title: 'Advanced Excel for Business',
        description: 'Master advanced Excel features for business analysis and reporting',
        contentTypeId: 26,
        contentType: 'eLearning Course',
        category: 'Business Analytics',
        difficulty: 'intermediate',
        duration: 360,
        thumbnail: '/api/placeholder/300/200',
        author: { id: 'author-015', name: 'Business Analytics Team', avatar: '/api/placeholder/40/40' },
        tags: ['excel', 'business analytics', 'reporting'],
        rating: { average: 4.6, count: 456 },
        enrollment: { enrolled: 2345 },
        status: 'published',
        createdAt: '2024-03-15T12:30:00Z',
        updatedAt: '2024-06-17T14:15:00Z',
        price: { amount: 89.99, currency: 'USD' },
        prerequisites: ['Basic Excel knowledge'],
        learningObjectives: ['Master advanced formulas', 'Create pivot tables', 'Build dashboards'],
        metadata: { scormCompliant: true, trackingEnabled: true, certificateAvailable: true },
        viewType: 1, // Direct View
        directViewUrl: '/learning-modules/lm-001', // Direct view URL for this module
        isInMyLearning: false, // Not in My Learning
        isInCart: false, // Not in Cart
    }
];