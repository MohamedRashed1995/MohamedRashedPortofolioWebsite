import type {
  Project,
  AiEvaluationCase,
  CodeReviewSnippet,
  GitHubMetrics,
  TechStackItem,
} from '@/types';

export const projects: Project[] = [
  {
    id: '1',
    slug: 'adros-core',
    title: 'Adros Core LMS Platform',
    titleAr: 'منصة Adros Core – إدارة التعلم وفق معمارية Clean Architecture و CQRS',
    shortDescription:
      'Clean Architecture LMS platform for course catalog management, student enrollment, progress tracking, and instructor analytics.',
    shortDescriptionAr:
      'منصة تعليمية مؤسسية لإدارة المقررات الدراسية وتتبع تقدم الطلاب الأكاديمي، مبنية وفق معمارية Clean Architecture ونمط CQRS مع عزل كامل لقواعد العمل.',
    longDescription:
      'Adros Core is an enterprise learning management system engineered with ASP.NET Core and Clean Architecture principles. It handles course catalogs, student enrollment pipelines, academic progress metrics, and instructor analytics. The domain layer remains strictly isolated from infrastructure concerns, leveraging EF Core repositories, CQRS command/query pipelines with MediatR, and a RESTful Web API consumed by a modern frontend.',
    longDescriptionAr:
      'نظام Adros Core هو منصة تعليمية متكاملة مصممة بالاعتماد على معمارية Clean Architecture في بيئة ASP.NET Core. يتيح النظام إدارة الكتالوج الأكاديمي، تسجيل الطلاب، وحساب مؤشرات الإنجاز للمقررات، مع لوحات تحكم للمحاضرين. تم عزل طبقة النطاق (Domain) تماماً عن قواعد البيانات والخدمات الخارجية لضمان أعلى معايير الجودة وسهولة الاختبار والصيانة.',
    keyFeatures: [
      {
        title: 'Clean Domain Isolation',
        titleAr: 'عزل طبقة النطاق وقواعد العمل (Domain Isolation)',
        description: 'Domain entities, value objects, and domain events strictly decoupled from infrastructure.',
        descriptionAr: 'عزل كيانات الكورسات والتسجيلات وقواعد العمل بشكل مستقل تماماً عن قواعد البيانات والخدمات الخارجية.',
      },
      {
        title: 'CQRS & MediatR Pipeline',
        titleAr: 'معالجة العمليات بنمط CQRS و MediatR',
        description: 'High-throughput command and query separation with automated validation pipelines.',
        descriptionAr: 'فصل كامل بين أوامر الكتابة والتعديل واستعلامات القراءة مع خطوط تحقق صحة المدخلات التلقائية.',
      },
      {
        title: 'Automated Academic Progress',
        titleAr: 'متابعة تقدم الطلاب الأكاديمي آلياً',
        description: 'Real-time calculation of student module completions, grading, and certification triggers.',
        descriptionAr: 'حساب فوري لنسب إنجاز المواد التعليمية، والاختبارات، وإصدار شهادات الإتمام آلياً.',
      },
      {
        title: 'Multi-Role Security (RBAC)',
        titleAr: 'صلاحيات متعددة المستويات (RBAC)',
        description: 'Granular JWT authorization distinguishing Instructors, Students, and Academic Administrators.',
        descriptionAr: 'نظام توثيق JWT يفرّق بدقة بين صلاحيات المحاضرين، الطلاب، والمشرفين الأكاديميين.',
      },
    ],
    tags: ['.NET 8', 'Clean Architecture', 'EF Core', 'CQRS', 'SQL Server', 'RESTful APIs'],
    role: 'Full-Stack Engineer',
    roleAr: 'مهندس برمجيات متكامل (Full-Stack)',
    period: '2023 — 2024',
    featured: true,
    image: '/projects/adros-core.png',
    repoUrl: 'https://github.com/MohamedRashed1995/adros-core',
    thumbnailColor: 'from-cyan-500/20 to-cyan-700/10',
    layers: [
      {
        name: 'Domain',
        nameAr: 'طبقة النطاق (Domain Layer)',
        description: 'Core business entities, value objects, and domain events.',
        descriptionAr: 'كيانات الأعمال الأساسية (الكورسات، التسجيلات، الطلاب) وقواعد العمل المستقلة.',
        responsibilities: ['Course, Enrollment, Student entities', 'Domain events & invariant rules', 'No external dependencies'],
        responsibilitiesAr: ['كيانات المقررات والطلاب والتسجيل', 'أحداث النطاق وقواعد صحة البيانات', 'استقلالية كاملة عن أي مكتبات خارجية'],
      },
      {
        name: 'Application',
        nameAr: 'طبقة التطبيق (Application Layer)',
        description: 'Use cases, commands, queries, and DTOs with MediatR.',
        descriptionAr: 'حالات الاستخدام، أوامر الكتابة والاستعلامات، وخطوط التحقق ونقل البيانات.',
        responsibilities: ['CQRS handlers (Commands & Queries)', 'FluentValidation request pipelines', 'DTO mapping & business workflows'],
        responsibilitiesAr: ['معالجات CQRS للأوامر والاستعلامات', 'خطوط التحقق من صحة المدخلات', 'تحويل البيانات وإدارة تدفق العمليات'],
      },
      {
        name: 'Infrastructure',
        nameAr: 'طبقة البنية التحتية (Infrastructure Layer)',
        description: 'Persistence, external services, and database integration.',
        descriptionAr: 'قواعد البيانات ومستودعات EF Core وخدمات البريد والملفات الخارجية.',
        responsibilities: ['EF Core DbContext & SQL Server repositories', 'Repository pattern implementations', 'Email & cloud file storage adapters'],
        responsibilitiesAr: ['سياق قاعدة البيانات EF Core و SQL Server', 'تطبيق نمط المستودعات (Repository Pattern)', 'محولات التخزين السحابي وخدمات البريد'],
      },
      {
        name: 'WebApi',
        nameAr: 'طبقة واجهة البرمجة (WebApi Layer)',
        description: 'HTTP entry point, JWT authentication, and OpenAPI documentation.',
        descriptionAr: 'نقطة الدخول لطلبات HTTP والتوثيق الأمني عبر JWT وتوثيق Swagger.',
        responsibilities: ['RESTful Controllers & Minimal APIs', 'JWT role-based authentication middleware', 'Swagger / OpenAPI specifications'],
        responsibilitiesAr: ['وحدات التحكم ونقاط نهاية REST API', 'برمجيات وسيطة للتحقق من صلاحيات JWT', 'توثيق واجهات الـ API عبر Swagger'],
      },
    ],
    apiEndpoints: [
      {
        method: 'GET',
        path: '/api/playground/adros/courses',
        description: 'List all available courses with enrollment counts.',
        sampleResponse: {
          data: [
            { id: 'c1', title: 'Intro to Clean Architecture', enrollments: 1240, instructor: 'M. Rashed' },
            { id: 'c2', title: 'Advanced EF Core', enrollments: 856, instructor: 'M. Rashed' },
            { id: 'c3', title: 'CQRS in Practice', enrollments: 412, instructor: 'S. Hassan' },
          ],
          total: 3,
        },
      },
      {
        method: 'GET',
        path: '/api/playground/adros/courses/c1/students',
        description: 'Get enrolled students for a specific course.',
        sampleResponse: {
          data: [
            { id: 's1', name: 'Ahmed Ali', progress: 78 },
            { id: 's2', name: 'Sara Mostafa', progress: 92 },
            { id: 's3', name: 'Omar Khaled', progress: 45 },
          ],
          total: 3,
        },
      },
    ],
    schemaTables: [
      {
        name: 'Courses',
        columns: [
          { name: 'Id', type: 'uniqueidentifier', isPrimaryKey: true, isForeignKey: false, isNullable: false },
          { name: 'Title', type: 'nvarchar(200)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
          { name: 'InstructorId', type: 'uniqueidentifier', isPrimaryKey: false, isForeignKey: true, isNullable: false },
          { name: 'CreatedAt', type: 'datetime2', isPrimaryKey: false, isForeignKey: false, isNullable: false },
        ],
        relationships: [{ fromTable: 'Courses', fromColumn: 'InstructorId', toTable: 'Instructors', toColumn: 'Id' }],
      },
      {
        name: 'Enrollments',
        columns: [
          { name: 'Id', type: 'uniqueidentifier', isPrimaryKey: true, isForeignKey: false, isNullable: false },
          { name: 'CourseId', type: 'uniqueidentifier', isPrimaryKey: false, isForeignKey: true, isNullable: false },
          { name: 'StudentId', type: 'uniqueidentifier', isPrimaryKey: false, isForeignKey: true, isNullable: false },
          { name: 'Progress', type: 'int', isPrimaryKey: false, isForeignKey: false, isNullable: false },
        ],
        relationships: [
          { fromTable: 'Enrollments', fromColumn: 'CourseId', toTable: 'Courses', toColumn: 'Id' },
          { fromTable: 'Enrollments', fromColumn: 'StudentId', toTable: 'Students', toColumn: 'Id' },
        ],
      },
      {
        name: 'Students',
        columns: [
          { name: 'Id', type: 'uniqueidentifier', isPrimaryKey: true, isForeignKey: false, isNullable: false },
          { name: 'Name', type: 'nvarchar(100)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
          { name: 'Email', type: 'nvarchar(200)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
        ],
        relationships: [],
      },
      {
        name: 'Instructors',
        columns: [
          { name: 'Id', type: 'uniqueidentifier', isPrimaryKey: true, isForeignKey: false, isNullable: false },
          { name: 'Name', type: 'nvarchar(100)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
        ],
        relationships: [],
      },
    ],
  },
  {
    id: '2',
    slug: 'helpdesk-systems',
    title: 'HelpDesk Systems Platform',
    titleAr: 'منصة HelpDesk Systems – إدارة تذاكر الدعم الفني وتحديثات SignalR الفورية',
    shortDescription:
      'Multi-tenant support ticketing platform with SLA monitoring, automatic agent routing, and real-time SignalR notifications.',
    shortDescriptionAr:
      'منصة سحابية متقدمة لإدارة تذاكر الدعم الفني متعددة المستأجرين مع تتبع اتفاقيات مستوى الخدمة (SLA)، وتوجيه التذاكر التلقائي، وتحديثات فورية عبر SignalR.',
    longDescription:
      'HelpDesk Systems is a high-availability multi-tenant customer support and ticketing platform. It features automatic ticket distribution algorithms based on agent workload and domain urgency, real-time SLA deadline monitoring with proactive escalation alerts, an indexed knowledge base, and an interactive agent command center powered by ASP.NET Core SignalR hubs.',
    longDescriptionAr:
      'منصة HelpDesk Systems هي نظام متطور لإدارة خدمة العملاء والدعم الفني للمؤسسات متعددة الفروع والمستأجرين. صُممت بأحدث تقنيات ASP.NET Core و SignalR لتوفير بث فوري للتحديثات دون الحاجة لإعادة تحميل الصفحة، وتتضمن محركاً ذكياً لتوجيه التذاكر وتوزيع الأحمال على الموظفين، وحساباً دقيقاً لمهل الاستجابة والحل وفق اتفاقيات مستوى الخدمة (SLA).',
    keyFeatures: [
      {
        title: 'Intelligent Ticket Routing',
        titleAr: 'توجيه التذاكر الذكي وتوزيع الأحمال',
        description: 'Auto-assignment based on agent capacity, issue categorization, and priority queues.',
        descriptionAr: 'توزيع تذاكر الدعم التلقائي على الموظفين وفق حجم العمل الحالي والخبرة ونوع المشكلة.',
      },
      {
        title: 'SLA Tracking & Auto-Escalation',
        titleAr: 'تتبع اتفاقيات مستوى الخدمة (SLA) والتصعيد التلقائي',
        description: 'Precise countdown metrics and automated escalation alerts for impending breaches.',
        descriptionAr: 'مؤقتات زمنية فورية لحساب أوقات الاستجابة مع إشعار المدراء والتصعيد التلقائي قبل نفاد الوقت.',
      },
      {
        title: 'Real-Time SignalR Broadcast',
        titleAr: 'بث التحديثات الفورية عبر SignalR',
        description: 'Instant synchronized updates on ticket status transitions, agent replies, and priority changes.',
        descriptionAr: 'تحديث واجهة الموظفين والعملاء فوراً عند إضافة أي رد أو تغيير حالة التذكرة دون إعادة تحميل.',
      },
      {
        title: 'Integrated Knowledge Base',
        titleAr: 'قاعدة المعرفة والحلول السريعة',
        description: 'Indexed self-service support documentation and reusable response templates.',
        descriptionAr: 'محرك بحث متكامل للمقالات الإرشادية وقوالب الردود السريعة لتسريع حل الاستفسارات الشائعة.',
      },
    ],
    tags: ['.NET 8', 'SignalR', 'Clean Architecture', 'SQL Server', 'Real-time', 'WebSockets'],
    role: 'Full-Stack Engineer',
    roleAr: 'مهندس برمجيات متكامل (Full-Stack)',
    period: '2022 — 2023',
    featured: true,
    image: '/projects/helpdesk.png',
    repoUrl: 'https://github.com/MohamedRashed1995/helpdesk-systems',
    thumbnailColor: 'from-emerald-500/20 to-emerald-700/10',
    layers: [
      {
        name: 'Domain',
        nameAr: 'طبقة النطاق (Domain Layer)',
        description: 'Ticket lifecycle state machine, SLA policies, and Agent aggregates.',
        descriptionAr: 'آلة حالات التذاكر، سياسات اتفاقيات الخدمة SLA، وكيانات الموظفين.',
        responsibilities: ['Ticket entity & status state machine', 'SLA policy & penalty business logic', 'Agent capacity & workload models'],
        responsibilitiesAr: ['كيانات التذاكر ودورة حياتها', 'قواعد احتساب أوقات اتفاقية الخدمة SLA', 'نماذج قياس طاقة واستيعاب الموظفين'],
      },
      {
        name: 'Application',
        nameAr: 'طبقة التطبيق (Application Layer)',
        description: 'Ticket commands, routing queries, and escalation handlers.',
        descriptionAr: 'معالجات إنشاء وإسناد التذاكر، خوارزميات التوجيه، وإجراءات التصعيد.',
        responsibilities: ['CreateTicket & AssignAgent commands', 'Automated routing algorithm queries', 'SLA breach escalation dispatchers'],
        responsibilitiesAr: ['أوامر إنشاء وإسناد وإغلاق التذاكر', 'استعلامات وخوارزميات التوزيع التلقائي', 'معالجات إشعارات التصعيد عند تأخر الرد'],
      },
      {
        name: 'Infrastructure',
        nameAr: 'طبقة البنية التحتية (Infrastructure Layer)',
        description: 'EF Core DbContext, SignalR Hubs, and notification gateways.',
        descriptionAr: 'مستودعات البيانات، خوادم البث المباشر SignalR، وبوابات الإشعارات.',
        responsibilities: ['EF Core persistence & transaction handling', 'SignalR real-time messaging hubs', 'Email & SMS notification dispatchers'],
        responsibilitiesAr: ['حفظ البيانات والمعاملات عبر EF Core', 'خوادم SignalR للبث الفوري المتزامن', 'بوابات إرسال إشعارات البريد والرسائل'],
      },
      {
        name: 'WebApi',
        nameAr: 'طبقة واجهة البرمجة (WebApi Layer)',
        description: 'REST API endpoints and SignalR websocket connections.',
        descriptionAr: 'نقاط نهاية الـ REST API ومسارات اتصالات الـ WebSockets.',
        responsibilities: ['Ticket & Agent REST controllers', 'SignalR hub routing & authentication', 'API key & JWT security middleware'],
        responsibilitiesAr: ['وحدات التحكم بإدارة التذاكر والموظفين', 'توجيه وتأمين مسارات اتصالات SignalR', 'برمجيات التحقق الأمني بالـ JWT'],
      },
    ],
    apiEndpoints: [
      {
        method: 'GET',
        path: '/api/playground/helpdesk/tickets',
        description: 'List recent support tickets with status and SLA info.',
        sampleResponse: {
          data: [
            { id: 't1', subject: 'Login not working', priority: 'High', status: 'Open', slaRemaining: '02:14:00' },
            { id: 't2', subject: 'Billing question', priority: 'Medium', status: 'In Progress', slaRemaining: '08:30:00' },
            { id: 't3', subject: 'Feature request', priority: 'Low', status: 'Open', slaRemaining: '23:59:00' },
          ],
          total: 3,
        },
      },
      {
        method: 'GET',
        path: '/api/playground/helpdesk/agents',
        description: 'List support agents and their current workload.',
        sampleResponse: {
          data: [
            { id: 'a1', name: 'Agent Mona', activeTickets: 4, avgResponseMins: 12 },
            { id: 'a2', name: 'Agent Tarek', activeTickets: 7, avgResponseMins: 18 },
          ],
          total: 2,
        },
      },
    ],
    schemaTables: [
      {
        name: 'Tickets',
        columns: [
          { name: 'Id', type: 'uniqueidentifier', isPrimaryKey: true, isForeignKey: false, isNullable: false },
          { name: 'Subject', type: 'nvarchar(300)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
          { name: 'AgentId', type: 'uniqueidentifier', isPrimaryKey: false, isForeignKey: true, isNullable: true },
          { name: 'Status', type: 'int', isPrimaryKey: false, isForeignKey: false, isNullable: false },
          { name: 'SlaDeadline', type: 'datetime2', isPrimaryKey: false, isForeignKey: false, isNullable: false },
        ],
        relationships: [{ fromTable: 'Tickets', fromColumn: 'AgentId', toTable: 'Agents', toColumn: 'Id' }],
      },
      {
        name: 'Agents',
        columns: [
          { name: 'Id', type: 'uniqueidentifier', isPrimaryKey: true, isForeignKey: false, isNullable: false },
          { name: 'Name', type: 'nvarchar(100)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
          { name: 'MaxTickets', type: 'int', isPrimaryKey: false, isForeignKey: false, isNullable: false },
        ],
        relationships: [],
      },
      {
        name: 'KnowledgeBase',
        columns: [
          { name: 'Id', type: 'uniqueidentifier', isPrimaryKey: true, isForeignKey: false, isNullable: false },
          { name: 'Title', type: 'nvarchar(200)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
          { name: 'Body', type: 'nvarchar(max)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
        ],
        relationships: [],
      },
    ],
  },
  {
    id: '3',
    slug: 'dentzone-portal',
    title: 'Dentzone – Dental Clinics B2B E-Commerce & Inventory Management System',
    titleAr: 'Dentzone – منصة التجارة الإلكترونية وإدارة المخازن B2B لعيادات الأسنان',
    shortDescription:
      'A B2B e-commerce and inventory management platform tailored for dental clinics and dentists to procure dental supplies. The system features multi-warehouse inventory tracking, product catalog management, order processing, and supplier-to-clinic workflows.',
    shortDescriptionAr:
      'منصة متكاملة ومتجر إلكتروني B2B مخصص لخدمة دكاترة وعيادات الأسنان، يتيح لهم تصفح وشراء أدوات ومستلزمات الأسنان. يعتمد النظام على إدارة كاملة للمخازن، متابعة المنتجات والأصناف (Products & Inventory Control)، إدارة طلبات العملاء من الأطباء، ومعالجة المبيعات بسلاسة.',
    longDescription:
      'Dentzone is an enterprise-grade B2B e-commerce and multi-warehouse inventory management platform built specifically for dental supply distribution. It empowers dentists and dental clinics to browse verified medical catalogs, inspect live warehouse quantities, place bulk procurement orders, and streamline supplier dispatch. Architected with ASP.NET Core and Clean Architecture, it features strict domain isolation, CQRS pipelines, Entity Framework Core repositories, JWT role-based security, and transactional stock reservations.',
    longDescriptionAr:
      'منصة Dentzone هي نظام مؤسسي متكامل للتجارة الإلكترونية بين الشركات (B2B) وإدارة المخازن المتعددة المصمم لخدمة قطاع طب الأسنان. يتيح لأطباء وعيادات الأسنان تصفح الكتالوج الطبي المتكامل، ومتابعة الأرصدة المتاحة في المخازن فورياً، وتقديم طلبات الشراء، وأتمتة الفواتير وسلاسل الإمداد. مبني وفق معمارية Clean Architecture باستخدام ASP.NET Core و EF Core مع نظام أمان متقدم JWT وتحكم شامل بالصلاحيات.',
    keyFeatures: [
      {
        title: 'Inventory & Stock Management',
        titleAr: 'إدارة المخازن والأصناف والتنبيهات',
        description: 'Multi-warehouse inventory tracking, batch/lot monitoring, reorder threshold alerts, and real-time stock reservations.',
        descriptionAr: 'نظام إدارة المخازن والأصناف والتنبيه بالكميات وتتبع أرصدة المخازن المتعددة وإشعار نقص المخزون التلقائي.',
      },
      {
        title: 'Product Catalog & Categorization',
        titleAr: 'كتالوج المنتجات والمستلزمات الطبية',
        description: 'Categorized dental tools, equipment, impression materials, and surgical instruments with tiered B2B pricing.',
        descriptionAr: 'عرض المنتجات والمستلزمات الطبية وتصنيفها بدقة مع تسعير خاص لطلبات العيادات والكميات.',
      },
      {
        title: 'B2B Ordering System & Procurement',
        titleAr: 'نظام طلبات وتوريد B2B للعيادات',
        description: 'Streamlined clinic procurement workflows, automated quotation verification, purchase order fulfillment, and invoicing.',
        descriptionAr: 'تسجيل طلبات العيادات والأطباء وتسهيل عمليات الدفع والتوريد وتتبع خطوط الشحن والفواتير.',
      },
      {
        title: 'Role-Based Access Control (RBAC)',
        titleAr: 'صلاحيات وأمان مخصص للأدوار',
        description: 'Granular JWT authorization distinguishing System Administrators, Warehouse Keepers, Clinic Buyers, and Dentists.',
        descriptionAr: 'صلاحيات مخصصة للمشرفين، أصحاب المخازن، والأطباء ومسؤولي مشتريات العيادات لضمان سرية ودقة العمليات.',
      },
    ],
    tags: [
      'ASP.NET Core Web API',
      'C#',
      'Clean Architecture',
      'Entity Framework Core',
      'SQL Server',
      'JWT Authentication',
      'RESTful APIs',
    ],
    role: 'Backend Lead & Architect',
    period: '2021 — 2022',
    featured: true,
    image: '/projects/dentzone.png',
    repoUrl: 'https://github.com/MohamedRashed1995/dentzone-portal',
    thumbnailColor: 'from-blue-600/25 via-cyan-600/15 to-teal-500/10',
    layers: [
      {
        name: 'Domain',
        description: 'Dental products, warehouse stock allocations, clinic profiles, and B2B orders.',
        responsibilities: [
          'Product & Category aggregate roots',
          'WarehouseStock & reservation domain invariants',
          'B2B Order & Invoice business rules',
        ],
      },
      {
        name: 'Application',
        description: 'CQRS command handlers, order placement, and inventory synchronization.',
        responsibilities: [
          'CreateB2BOrderCommand & validation pipelines',
          'Stock reservation & replenishment queries',
          'Clinic procurement authorization handlers',
        ],
      },
      {
        name: 'Infrastructure',
        description: 'EF Core DbContext, SQL Server relational mapping, and transactional storage.',
        responsibilities: [
          'High-concurrency EF Core repository patterns',
          'Automated low-stock notification triggers',
          'Database migrations & index optimization',
        ],
      },
      {
        name: 'WebApi',
        description: 'RESTful API controllers with JWT authentication and Swagger documentation.',
        responsibilities: [
          'Inventory & Order management endpoints',
          'JWT authentication & Role-Based Access Control',
          'Swagger / OpenAPI specification documentation',
        ],
      },
    ],
    apiEndpoints: [
      {
        method: 'GET',
        path: '/api/v1/inventory/products',
        description: 'List dental products with multi-warehouse inventory levels, categories, and B2B prices.',
        sampleResponse: {
          data: [
            {
              id: 'prod-101',
              sku: 'DENT-COMP-A2',
              name: 'Universal Nano-Hybrid Composite A2',
              category: 'Restorative Materials',
              unitPrice: 42.5,
              totalStock: 340,
              warehouses: [
                { warehouse: 'Main Central Hub', quantity: 220 },
                { warehouse: 'Alexandria Depot', quantity: 120 },
              ],
              status: 'In Stock',
            },
            {
              id: 'prod-102',
              sku: 'DENT-BUR-TC',
              name: 'Tungsten Carbide Friction Grip Burs (Pack of 10)',
              category: 'Dental Burs & Rotary',
              unitPrice: 18.0,
              totalStock: 15,
              warehouses: [{ warehouse: 'Main Central Hub', quantity: 15 }],
              status: 'Low Stock Alert',
            },
          ],
          total: 2,
        },
      },
      {
        method: 'POST',
        path: '/api/v1/orders/b2b',
        description: 'Submit a new B2B dental supply procurement order for a verified clinic.',
        sampleResponse: {
          success: true,
          orderId: 'ORD-B2B-2026-8941',
          clinicId: 'CLN-ALEX-04',
          clinicName: 'Dr. Tarek Dental Specialty Center',
          itemsCount: 14,
          totalAmount: 1850.0,
          status: 'Confirmed & Stock Reserved',
          dispatchWarehouse: 'Main Central Hub',
          estimatedDelivery: '2026-08-30',
        },
      },
      {
        method: 'GET',
        path: '/api/v1/warehouses/stock-alert',
        description: 'Retrieve items below minimum threshold across all distribution warehouses.',
        sampleResponse: {
          alertCount: 3,
          items: [
            { sku: 'DENT-BUR-TC', name: 'Tungsten Carbide Burs', onHand: 15, minThreshold: 50 },
            { sku: 'DENT-IMPR-ALG', name: 'Fast Set Dental Alginate 500g', onHand: 8, minThreshold: 40 },
          ],
        },
      },
    ],
    schemaTables: [
      {
        name: 'Products',
        columns: [
          { name: 'Id', type: 'uniqueidentifier', isPrimaryKey: true, isForeignKey: false, isNullable: false },
          { name: 'Sku', type: 'nvarchar(50)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
          { name: 'Name', type: 'nvarchar(200)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
          { name: 'CategoryId', type: 'uniqueidentifier', isPrimaryKey: false, isForeignKey: true, isNullable: false },
          { name: 'UnitPrice', type: 'decimal(18,2)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
          { name: 'MinThreshold', type: 'int', isPrimaryKey: false, isForeignKey: false, isNullable: false },
        ],
        relationships: [{ fromTable: 'Products', fromColumn: 'CategoryId', toTable: 'Categories', toColumn: 'Id' }],
      },
      {
        name: 'Warehouses',
        columns: [
          { name: 'Id', type: 'uniqueidentifier', isPrimaryKey: true, isForeignKey: false, isNullable: false },
          { name: 'Name', type: 'nvarchar(100)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
          { name: 'LocationCode', type: 'nvarchar(50)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
          { name: 'ManagerName', type: 'nvarchar(100)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
        ],
        relationships: [],
      },
      {
        name: 'WarehouseStock',
        columns: [
          { name: 'Id', type: 'uniqueidentifier', isPrimaryKey: true, isForeignKey: false, isNullable: false },
          { name: 'WarehouseId', type: 'uniqueidentifier', isPrimaryKey: false, isForeignKey: true, isNullable: false },
          { name: 'ProductId', type: 'uniqueidentifier', isPrimaryKey: false, isForeignKey: true, isNullable: false },
          { name: 'QuantityOnHand', type: 'int', isPrimaryKey: false, isForeignKey: false, isNullable: false },
          { name: 'ReservedQuantity', type: 'int', isPrimaryKey: false, isForeignKey: false, isNullable: false },
        ],
        relationships: [
          { fromTable: 'WarehouseStock', fromColumn: 'WarehouseId', toTable: 'Warehouses', toColumn: 'Id' },
          { fromTable: 'WarehouseStock', fromColumn: 'ProductId', toTable: 'Products', toColumn: 'Id' },
        ],
      },
      {
        name: 'Clinics',
        columns: [
          { name: 'Id', type: 'uniqueidentifier', isPrimaryKey: true, isForeignKey: false, isNullable: false },
          { name: 'Name', type: 'nvarchar(150)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
          { name: 'LicenseNumber', type: 'nvarchar(50)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
          { name: 'Phone', type: 'nvarchar(20)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
          { name: 'Address', type: 'nvarchar(255)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
        ],
        relationships: [],
      },
      {
        name: 'Orders',
        columns: [
          { name: 'Id', type: 'uniqueidentifier', isPrimaryKey: true, isForeignKey: false, isNullable: false },
          { name: 'ClinicId', type: 'uniqueidentifier', isPrimaryKey: false, isForeignKey: true, isNullable: false },
          { name: 'OrderNumber', type: 'nvarchar(50)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
          { name: 'OrderDate', type: 'datetime2', isPrimaryKey: false, isForeignKey: false, isNullable: false },
          { name: 'TotalAmount', type: 'decimal(18,2)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
          { name: 'Status', type: 'nvarchar(50)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
        ],
        relationships: [{ fromTable: 'Orders', fromColumn: 'ClinicId', toTable: 'Clinics', toColumn: 'Id' }],
      },
      {
        name: 'OrderItems',
        columns: [
          { name: 'Id', type: 'uniqueidentifier', isPrimaryKey: true, isForeignKey: false, isNullable: false },
          { name: 'OrderId', type: 'uniqueidentifier', isPrimaryKey: false, isForeignKey: true, isNullable: false },
          { name: 'ProductId', type: 'uniqueidentifier', isPrimaryKey: false, isForeignKey: true, isNullable: false },
          { name: 'Quantity', type: 'int', isPrimaryKey: false, isForeignKey: false, isNullable: false },
          { name: 'UnitPrice', type: 'decimal(18,2)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
        ],
        relationships: [
          { fromTable: 'OrderItems', fromColumn: 'OrderId', toTable: 'Orders', toColumn: 'Id' },
          { fromTable: 'OrderItems', fromColumn: 'ProductId', toTable: 'Products', toColumn: 'Id' },
        ],
      },
    ],
  },
  {
    id: '4',
    slug: 'portfolio-website',
    title: 'Interactive Full-Stack Developer Portfolio & AI Engineering Lab',
    titleAr: 'الموقع التعريفي التفاعلي ومعمل هندسة البرمجيات والـ AI',
    shortDescription:
      'High-performance developer portfolio built with React 18, Vite, TypeScript, and Tailwind CSS featuring an interactive AI playground, Clean Architecture API simulation, bilingual (AR/EN) support, dynamic theme & accent customization, and 3D visual effects.',
    shortDescriptionAr:
      'بوابة تعريفية ومعمل هندسي تفاعلي متقدم مبني بـ React 18 و TypeScript و Tailwind CSS يضم محاكي واجهات برمجة التطبيقات لمعمارية Clean Architecture، ومختبر تقييم نماذج الذكاء الاصطناعي، ودعم كامل للغتين العربية والإنجليزية، ومحرك ثيمات وتخصيص ألوان مخصص.',
    longDescription:
      'An enterprise-grade interactive developer portfolio and architecture sandbox. Engineered with React 18, TypeScript, Tailwind CSS, and Framer Motion. It showcases live Clean Architecture simulated endpoints, SignalR ticket workflows, real-time AI code review evaluations, customizable theme accent palettes with localStorage persistence, and dynamic RTL/LTR bilingual support.',
    longDescriptionAr:
      'منصة وموقع تعريفي هندسي متكامل يجمع بين استعراض المشاريع البرمجية المتقدمة والمعامل التجريبية التفاعلية. صُمم بأحدث تقنيات الويب الحديثة (React 18, Vite, TypeScript, Framer Motion) مع دعم معايير الوصولية العالمية WCAG AA، ومحرك تبديل اللغات الفوري مع دعم محاذاة RTL للغة العربية، ومحاكي طلبات الـ API، ومصفوفة تقييمات نماذج الذكاء الاصطناعي البرمجية.',
    keyFeatures: [
      {
        title: 'Clean Architecture API Simulator',
        titleAr: 'محاكي واجهات برمجة التطبيقات (API Playground)',
        description: 'Live interactive endpoints simulating .NET backend responses with response inspection.',
        descriptionAr: 'تجربة استدعاءات حية تحاكي خوادم .NET مع فحص الاستجابات وترويسات HTTP المباشرة.',
      },
      {
        title: 'Bilingual Engine (AR / EN & RTL)',
        titleAr: 'محرك ثنائية اللغة والتخطيط المتجاوب RTL',
        description: 'Seamless Arabic / English localization with tailored typography and layout mirroring.',
        descriptionAr: 'دعم كامل وسلس للغة العربية والإنجليزية مع تعديل تلقائي للمحاذاة والخطوط (Cairo / Inter).',
      },
      {
        title: 'Dynamic Theme & Accent Engine',
        titleAr: 'محرك الثيمات وتخصيص لوحات الألوان',
        description: 'Real-time CSS variable mutations with dark/light modes and persistence in localStorage.',
        descriptionAr: 'تغيير ألوان المظهر واللكنات الضوئية فورياً مع حفظ التفضيلات محلياً في المتصفح.',
      },
      {
        title: 'AI Code Review & Evaluation Lab',
        titleAr: 'مختبر تقييم وتدقيق أكواد الذكاء الاصطناعي',
        description: 'Interactive benchmark matrices identifying hallucinations, security flaws, and async bugs.',
        descriptionAr: 'أداة تدقيق تفاعلية لكشف الثغرات الأمنية والأخطاء الخوارزمية في مخرجات نماذج الـ LLM.',
      },
    ],
    tags: ['React 18', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Vite', 'Google AI Studio'],
    role: 'Lead Full-Stack Architect',
    roleAr: 'المطور والمعماري البرمجي الرئيسي',
    period: '2024 — Present',
    featured: true,
    image: '/projects/portfolio.png',
    repoUrl: 'https://github.com/MohamedRashed1995/MohamedRashedPortofolioWebsite',
    liveUrl: 'https://ais-dev-zwndugi3rd25gz5xt7zuxs-5956997271.europe-west1.run.app',
    thumbnailColor: 'from-violet-600/25 via-blue-600/15 to-cyan-500/10',
    layers: [
      {
        name: 'Client Presentation Layer',
        nameAr: 'طبقة واجهة المستخدم والعرض',
        description: 'React 18 components, Framer Motion transitions, and responsive Tailwind UI.',
        descriptionAr: 'مكونات React 18، حركات Framer Motion التفاعلية، وتصميم Tailwind المتجاوب.',
        responsibilities: [
          'Adaptive RTL / LTR layout engine with Cairo & Inter typography',
          'Dynamic Theme & Color Accent switcher with live CSS variable mutation',
          'Interactive Developer Emblem (<MR />) and responsive Project Showcases',
        ],
        responsibilitiesAr: [
          'محرك تخطيط متكيف RTL / LTR مع خطوط Cairo و Inter',
          'مبدل سمات الألوان الحي وتعديل متغيرات CSS مباشرة',
          'شعار المطور التفاعلي المضيء واستعراض المشاريع بكروت زجاجية',
        ],
      },
      {
        name: 'Context & State Engine',
        nameAr: 'محرك الحالة وسياق التطبيق',
        description: 'Decoupled React Contexts providing persistent state synchronization.',
        descriptionAr: 'سياقات React مستقلة توفر مزامنة الحالة وتخزين التفضيلات.',
        responsibilities: [
          'LanguageContext (Arabic / English localization & RTL switcher)',
          'ThemeContext (Dark/Light + Custom Accent Palettes with localStorage)',
          'ProfileImageContext (Custom avatar & profile image managers)',
        ],
        responsibilitiesAr: [
          'سياق اللغة والترجمة العربية والإنجليزية وضبط RTL',
          'سياق الثيمات ولوحات الألوان المخصصة مع التخزين المحلي',
          'سياق الصورة الشخصية وإدارة الصور الرمزية',
        ],
      },
      {
        name: 'AI Evaluation & Sandbox Layer',
        nameAr: 'طبقة التقييم الذكي والملعب التجريبي',
        description: 'Interactive API simulator & LLM code generation benchmark suites.',
        descriptionAr: 'محاكي الـ API التفاعلي ومجموعات اختبار ومقارنة نماذج الذكاء الاصطناعي.',
        responsibilities: [
          'Clean Architecture API Playground with real JSON payload inspect',
          'Gemini AI hallucination & security flaw benchmark showcases',
          'SignalR real-time ticket escalation simulator',
        ],
        responsibilitiesAr: [
          'ملعب تجريبي لـ Clean Architecture مع استعراض استجابات JSON',
          'اختبارات كشف الهلوسة والثغرات الأمنية في نماذج الذكاء الاصطناعي',
          'محاكاة تصعيد التذاكر الفوري عبر SignalR',
        ],
      },
      {
        name: 'Build & Delivery Infrastructure',
        nameAr: 'بنية البناء والتشغيل والإنتاج',
        description: 'High-speed Vite bundling, ESLint validation, and Cloud Run production runtime.',
        descriptionAr: 'حزم برمجية سريعة بـ Vite، وتحقق ESLint، وتشغيل سحابي بـ Cloud Run.',
        responsibilities: [
          'Vite ESM optimized bundling with sub-millisecond HMR',
          'Zero external runtime backend dependencies for client reliability',
          'Full TypeScript strict mode and WCAG AA accessibility compliance',
        ],
        responsibilitiesAr: [
          'تجميع محسن بـ Vite ESM لتحقيق سرعة تحميل فائقة',
          'عدم الاعتماد على خوادم خارجية غير مستقرة لضمان الموثوقية',
          'تطبيق صارم لـ TypeScript وتوافق كامل مع معايير الوصولية WCAG AA',
        ],
      },
    ],
    apiEndpoints: [
      {
        method: 'GET',
        path: '/api/portfolio/meta',
        description: 'Retrieve portfolio architectural metadata, active theme, and tech capabilities.',
        sampleResponse: {
          data: {
            architect: 'Mohamed Rashed Abdelazim',
            version: '2.4.0',
            framework: 'React 18 + Vite + TypeScript',
            themeEngine: 'Dynamic CSS Variables & Framer Motion',
            aiIntegration: 'Google AI Studio & Gemini Benchmark Suite',
            github: 'https://github.com/MohamedRashed1995/MohamedRashedPortofolioWebsite',
          },
          status: 200,
        },
      },
      {
        method: 'POST',
        path: '/api/portfolio/contact',
        description: 'Submit an inquiry or schedule a technical engineering interview.',
        sampleResponse: {
          success: true,
          message: 'Inquiry received. Thank you for connecting with Mohamed Rashed.',
          timestamp: '2026-08-28T12:05:00Z',
        },
      },
    ],
    databaseSchema: [
      {
        name: 'UserPreferences',
        columns: [
          { name: 'Id', type: 'nvarchar(50)', isPrimaryKey: true, isForeignKey: false, isNullable: false },
          { name: 'Theme', type: 'nvarchar(20)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
          { name: 'AccentColor', type: 'nvarchar(20)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
          { name: 'Language', type: 'nvarchar(10)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
          { name: 'LastActive', type: 'datetime2', isPrimaryKey: false, isForeignKey: false, isNullable: false },
        ],
        relationships: [],
      },
      {
        name: 'ProjectShowcase',
        columns: [
          { name: 'Slug', type: 'nvarchar(100)', isPrimaryKey: true, isForeignKey: false, isNullable: false },
          { name: 'Title', type: 'nvarchar(200)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
          { name: 'Role', type: 'nvarchar(100)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
          { name: 'Featured', type: 'bit', isPrimaryKey: false, isForeignKey: false, isNullable: false },
        ],
        relationships: [],
      },
    ],
  },
];

export const aiEvaluationCases: AiEvaluationCase[] = [
  {
    id: 'ai1',
    title: 'Hallucinated API Method in C# Code Review',
    category: 'Hallucination',
    flawedResponse:
      'The AI suggested using `DbContext.BulkInsert()` — a method that does not exist in EF Core. It confidently described parameters and return types that are not part of any official EF Core API.',
    identifiedFlaw:
      'The model fabricated a method name and API surface. BulkInsert is a third-party extension (e.g., from EFCore.BulkExtensions), not a built-in EF Core method. Presenting it as native is misleading.',
    correctedEvaluation:
      'Flagged as a hallucination. The corrected guidance recommends either using AddRange + SaveChanges for moderate sets, or explicitly referencing the EFCore.BulkExtensions NuGet package with a clear note that it is third-party.',
    takeaway: 'Always verify that suggested APIs exist in the documented version of the framework.',
  },
  {
    id: 'ai2',
    title: 'SQL Injection Vulnerability Missed',
    category: 'Security',
    flawedResponse:
      'The AI reviewed a repository method using string concatenation ($"SELECT * FROM Users WHERE Name = \'{{name}}\'") and marked it as "clean and efficient" without flagging the SQL injection risk.',
    identifiedFlaw:
      'The model failed to identify a critical security vulnerability. Raw string interpolation in SQL is a textbook injection vector and should never pass a security review.',
    correctedEvaluation:
      'Flagged as Critical. The corrected review requires parameterized queries or EF Core LINQ, and notes that any raw SQL must use FromSqlInterpolated with proper parameter binding.',
    takeaway: 'Security review prompts must explicitly instruct the model to check for injection vectors.',
  },
  {
    id: 'ai3',
    title: 'Incorrect Async/Await Guidance',
    category: 'Correctness',
    flawedResponse:
      'The AI recommended calling `.Result` on an async method inside a controller action to "keep it synchronous for simplicity", claiming this is safe in ASP.NET Core.',
    identifiedFlaw:
      'Using `.Result` on an async method can cause deadlocks in ASP.NET Core request contexts and defeats the purpose of async. The advice is actively harmful.',
    correctedEvaluation:
      'Flagged as a correctness error. The corrected guidance is to await the async method properly, keeping the controller action async and returning Task<T>.',
    takeaway: 'Async/await patterns require careful evaluation — models often give outdated sync-over-async advice.',
  },
  {
    id: 'ai4',
    title: 'Over-Engineered Solution for Simple CRUD',
    category: 'Over-engineering',
    flawedResponse:
      'For a simple internal CRUD screen, the AI recommended a full CQRS + Mediator + 4-layer Clean Architecture setup with separate command and query objects for every operation.',
    identifiedFlaw:
      'The recommendation ignores context. For a small internal tool, this level of ceremony adds complexity without benefit. The model applied a one-size-fits-all enterprise pattern.',
    correctedEvaluation:
      'Flagged as over-engineering. The corrected review recommends a simple repository or direct DbContext usage for internal CRUD, reserving CQRS for complex domains with real read/write asymmetry.',
    takeaway: 'Architecture recommendations must match the scale and complexity of the actual problem.',
  },
];

export const codeReviewSnippets: CodeReviewSnippet[] = [
  {
    id: 'cr1',
    label: 'Repository with raw SQL (injection risk)',
    code: `public User GetUserByName(string name)
{
    var sql = $"SELECT * FROM Users WHERE Name = '{name}'";
    return _context.Users.FromSqlRaw(sql).FirstOrDefault();
}`,
    annotations: [
      { line: 3, severity: 'critical', comment: 'String interpolation in SQL enables injection. Use parameterized queries or LINQ.' },
      { line: 4, severity: 'warning', comment: 'FromSqlRaw with interpolated string bypasses parameter binding.' },
    ],
  },
  {
    id: 'cr2',
    label: 'Sync-over-async in controller',
    code: `[HttpGet("{id}")]
public User GetById(Guid id)
{
    var user = _userService.GetByIdAsync(id).Result;
    return user;
}`,
    annotations: [
      { line: 4, severity: 'critical', comment: '.Result on a Task can deadlock in request context. Make the action async and await.' },
      { line: 2, severity: 'warning', comment: 'Action should return Task<ActionResult<User>>.' },
    ],
  },
  {
    id: 'cr3',
    label: 'Missing null-check on dependency',
    code: `public class OrderService
{
    private readonly IPaymentGateway _gateway;

    public OrderService(IPaymentGateway gateway)
    {
        _gateway = gateway;
    }

    public void Process(Order order)
    {
        _gateway.Charge(order.Amount);
    }
}`,
    annotations: [
      { line: 8, severity: 'info', comment: 'Consider null-checking or using ArgumentNullException.ThrowIfNull for defensive construction.' },
      { line: 12, severity: 'warning', comment: 'No null-check on order parameter before accessing order.Amount.' },
    ],
  },
  {
    id: 'cr4',
    label: 'Clean — proper async EF Core query',
    code: `public async Task<User?> GetUserByNameAsync(string name)
{
    return await _context.Users
        .Where(u => u.Name == name)
        .FirstOrDefaultAsync();
}`,
    annotations: [
      { line: 2, severity: 'info', comment: 'Good: uses LINQ with parameterized query generation.' },
      { line: 5, severity: 'info', comment: 'Good: properly awaited, nullable return type signals possible null.' },
    ],
  },
];

export const githubMetrics: GitHubMetrics = {
  totalRepos: 42,
  topLanguages: [
    { language: 'C#', percentage: 58 },
    { language: 'TypeScript', percentage: 22 },
    { language: 'Python', percentage: 12 },
    { language: 'SQL', percentage: 8 },
  ],
  totalCommitsLast90Days: 318,
  lastSyncedAt: '2026-08-27T22:00:00Z',
};

export const techStack: TechStackItem[] = [
  {
    category: 'Backend',
    items: [
      { name: '.NET 8 / ASP.NET Core', proficiency: 95 },
      { name: 'Entity Framework Core', proficiency: 92 },
      { name: 'CQRS / MediatR', proficiency: 88 },
      { name: 'SignalR', proficiency: 80 },
    ],
  },
  {
    category: 'Frontend',
    items: [
      { name: 'React + TypeScript', proficiency: 85 },
      { name: 'Angular', proficiency: 75 },
      { name: 'Tailwind CSS', proficiency: 90 },
    ],
  },
  {
    category: 'Database',
    items: [
      { name: 'SQL Server', proficiency: 92 },
      { name: 'PostgreSQL', proficiency: 78 },
      { name: 'Redis', proficiency: 70 },
    ],
  },
  {
    category: 'AI & Evaluation',
    items: [
      { name: 'LLM Evaluation', proficiency: 88 },
      { name: 'Prompt Engineering', proficiency: 85 },
      { name: 'Python', proficiency: 80 },
    ],
  },
];

export const SEED_PROJECTS = projects;
export const SEED_AI_CASES = aiEvaluationCases;
export const SEED_TECH_STACK = techStack;

export const SEED_ADMIN_USER = {
  id: 'admin-seed-01',
  email: 'mrashed19951995@gmail.com',
  password: 'Password@123',
  name: 'Mohamed Rashed Abdelazim',
  role: 'Admin',
  createdAt: '2026-08-28T00:00:00.000Z',
};

