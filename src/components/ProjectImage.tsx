import React, { useState, useEffect } from 'react';
import {
  Code2,
  GraduationCap,
  Headphones,
  Stethoscope,
  Sparkles,
  Layers,
  Terminal,
  ShoppingCart,
  Cpu,
  Server,
  type LucideIcon,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

interface ProjectImageProps {
  src?: string;
  alt?: string;
  title?: string;
  titleAr?: string;
  slug?: string;
  category?: string;
  tags?: string[];
  className?: string;
  imgClassName?: string;
  aspectRatio?: 'video' | 'wide' | 'square' | 'auto';
  showCategoryBadge?: boolean;
  showSnippetPreview?: boolean;
}

interface CategoryConfig {
  icon: LucideIcon;
  label: string;
  labelAr: string;
  codeSnippet: string;
  categoryTag: string;
  subType: string;
}

function getCategoryConfig(slug?: string, title?: string, tags: string[] = []): CategoryConfig {
  const text = `${slug || ''} ${title || ''} ${tags.join(' ')}`.toLowerCase();

  if (text.includes('adros') || text.includes('lms') || text.includes('course') || text.includes('learning')) {
    return {
      icon: GraduationCap,
      label: 'LMS Platform & Clean Architecture',
      labelAr: 'منصة تعليمية ومعمارية نظيفة',
      categoryTag: 'LMS • CQRS • MediatR',
      subType: 'Education',
      codeSnippet: `// CourseEnrollmentHandler.cs\npublic async Task<Result> Handle(EnrollCommand cmd)\n{\n  var student = await _repo.GetAsync(cmd.Id);\n  student.Enroll(cmd.CourseId);\n  return Result.Success();\n}`,
    };
  }

  if (text.includes('helpdesk') || text.includes('ticket') || text.includes('support')) {
    return {
      icon: Headphones,
      label: 'Support Desk & SLA Engine',
      labelAr: 'نظام إدارة الدعم الفني وتذاكر الخدمة',
      categoryTag: 'SignalR • SLA • Real-Time',
      subType: 'Support Desk',
      codeSnippet: `// TicketRoutingEngine.cs\npublic Ticket Route(Ticket ticket)\n{\n  var agent = _balancer.GetAvailableAgent();\n  ticket.AssignTo(agent, SLA.PriorityHours);\n  return ticket;\n}`,
    };
  }

  if (text.includes('dent') || text.includes('clinic') || text.includes('medical') || text.includes('patient') || text.includes('health')) {
    return {
      icon: Stethoscope,
      label: 'Healthcare & Clinic Portal',
      labelAr: 'نظام إدارة العيادات والمواعيد الطبية',
      categoryTag: 'Healthcare • EF Core • Multi-Clinic',
      subType: 'Healthcare',
      codeSnippet: `// AppointmentBookingService.cs\npublic async Task<Slot> BookAsync(PatientId id, Slot slot)\n{\n  await _scheduleValidator.EnsureNoConflict(slot);\n  return await _dbContext.Appointments.AddAsync(slot);\n}`,
    };
  }

  if (text.includes('ecommerce') || text.includes('shop') || text.includes('store') || text.includes('cart') || text.includes('order')) {
    return {
      icon: ShoppingCart,
      label: 'E-Commerce & Orders API',
      labelAr: 'منصة التجارة الإلكترونية والطلبات',
      categoryTag: 'E-Commerce • Microservices',
      subType: 'Commerce',
      codeSnippet: `// CheckoutProcessor.cs\npublic async Task<OrderResult> Process(Cart cart)\n{\n  await _inventory.ReserveStock(cart.Items);\n  return await _paymentGateway.ChargeAsync(cart);\n}`,
    };
  }

  if (text.includes('ai') || text.includes('eval') || text.includes('llm') || text.includes('bench') || text.includes('prompt')) {
    return {
      icon: Sparkles,
      label: 'AI Code Evaluation & RLHF',
      labelAr: 'تدقيق نماذج الذكاء الاصطناعي البرمجية',
      categoryTag: 'AI Eval • LLM Benchmarking',
      subType: 'AI Engineering',
      codeSnippet: `// ModelBenchmarkEvaluator.cs\npublic BenchmarkResult Evaluate(string generatedCode)\n{\n  var ast = _parser.Parse(generatedCode);\n  return _rulesEngine.AuditSecurityVulnerabilities(ast);\n}`,
    };
  }

  if (text.includes('portfolio') || text.includes('rashed') || text.includes('web')) {
    return {
      icon: Code2,
      label: 'Full-Stack Developer Platform',
      labelAr: 'منصة استعراض المشاريع والأنظمة',
      categoryTag: 'React 18 • TypeScript • Tailwind',
      subType: 'Portfolio',
      codeSnippet: `// PortfolioArchitecture.cs\npublic class PlatformConfig\n{\n  public string TechStack => "ASP.NET Core 8 + React";\n  public bool CleanArchitecture => true;\n}`,
    };
  }

  return {
    icon: Layers,
    label: '.NET Enterprise System',
    labelAr: 'نظام مؤسسي متكامل في .NET',
    categoryTag: '.NET 8 • Clean Architecture',
    subType: 'Enterprise',
    codeSnippet: `// EnterpriseEngine.cs\npublic async Task ExecuteUseCaseAsync()\n{\n  await _pipeline.SendAsync(new Command());\n}`,
  };
}

export const ProjectImage: React.FC<ProjectImageProps> = ({
  src,
  alt = 'Project Image',
  title = 'Project',
  titleAr,
  slug,
  tags = [],
  className = '',
  imgClassName = '',
  aspectRatio = 'video',
  showCategoryBadge = true,
  showSnippetPreview = false,
}) => {
  const { isRTL } = useLanguage();
  const { isDark } = useTheme();
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(!src);
    setIsLoaded(false);
  }, [src]);

  const config = getCategoryConfig(slug, title, tags);
  const IconComponent = config.icon;
  const displayTitle = isRTL && titleAr ? titleAr : title;
  const displayLabel = isRTL && config.labelAr ? config.labelAr : config.label;

  const aspectClass =
    aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === 'wide'
      ? 'aspect-[21/9]'
      : aspectRatio === 'square'
      ? 'aspect-square'
      : '';

  return (
    <div
      className={`relative w-full overflow-hidden select-none bg-theme-bg-sec border border-theme-border/60 flex items-center justify-center transition-colors duration-300 ${aspectClass} ${className}`}
    >
      {/* If valid src and not in error, try rendering the img */}
      {src && !hasError ? (
        <>
          <img
            src={src}
            alt={alt || displayTitle}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              setHasError(true);
            }}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            } ${imgClassName}`}
          />

          {/* Dynamic Theme Skeleton loader while loading */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-theme-card/90 backdrop-blur-sm animate-pulse flex items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-theme-accent-light border border-theme-accent/30 flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-theme-accent animate-bounce" />
              </div>
            </div>
          )}
        </>
      ) : (
        /* DYNAMIC THEME-AWARE PROJECT PLACEHOLDER */
        <div
          className="w-full h-full p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden text-theme-text transition-colors duration-300"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-card) 50%, var(--color-bg-secondary) 100%)'
              : 'linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-hover) 50%, var(--color-bg-primary) 100%)',
          }}
        >
          {/* Dynamic Theme Radial Background Glow */}
          <div
            className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-500"
            style={{
              backgroundColor: 'var(--color-glow)',
              opacity: isDark ? 0.35 : 0.25,
            }}
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-500"
            style={{
              backgroundColor: 'var(--color-accent-secondary)',
              opacity: isDark ? 0.2 : 0.15,
            }}
            aria-hidden="true"
          />

          {/* Dynamic Geometric Tech Grid Overlay */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              backgroundImage: 'radial-gradient(var(--color-border-hover) 1px, transparent 1px)',
              backgroundSize: '18px 18px',
              opacity: isDark ? 0.22 : 0.35,
            }}
            aria-hidden="true"
          />

          {/* Top Header Bar */}
          <div className="relative z-10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-theme-card/90 backdrop-blur-md border border-theme-border shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                <IconComponent className="w-4 h-4 text-theme-accent" />
              </div>
              {showCategoryBadge && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-theme-accent/40 bg-theme-accent-light text-theme-accent backdrop-blur-md shadow-xs">
                  {displayLabel}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-theme-card/80 border border-theme-border text-[10px] font-mono tracking-wider text-theme-muted">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ACTIVE</span>
            </div>
          </div>

          {/* Center Content / Code Snippet */}
          <div className="relative z-10 my-auto py-2">
            {showSnippetPreview ? (
              <div className="p-3 rounded-lg bg-theme-card/80 backdrop-blur-sm border border-theme-border font-mono text-[11px] text-theme-text-sec overflow-hidden leading-relaxed shadow-inner">
                <pre className="whitespace-pre-wrap">{config.codeSnippet}</pre>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base sm:text-lg font-bold text-theme-text tracking-tight line-clamp-1">
                    {displayTitle}
                  </h4>
                </div>
                <p className="text-xs text-theme-muted font-mono line-clamp-1 flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-theme-accent shrink-0" />
                  <span>{tags.slice(0, 3).join(' • ') || config.categoryTag}</span>
                </p>
              </div>
            )}
          </div>

          {/* Bottom Architectural Spec Footer */}
          <div className="relative z-10 flex items-center justify-between text-[11px] text-theme-muted border-t border-theme-border pt-2 font-mono">
            <span className="flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-theme-accent" />
              <span className="text-theme-text-sec">.NET 8 Clean Arch</span>
            </span>
            <span className="flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-theme-accent-sec" />
              <span className="text-theme-text-sec">{config.subType}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectImage;
