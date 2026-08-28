import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Sparkles, Target, FileDown, Eye, Linkedin, Github } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import PageTransition from '@/components/PageTransition';
import { useLanguage } from '@/context/LanguageContext';
import { useProfileImage } from '@/context/ProfileImageContext';
import { useSiteContent } from '@/hooks/useSiteContent';
import { CvPreviewModal } from '@/components/CvPreviewModal';
import { downloadCvPdf } from '@/utils/downloadCv';

export default function About() {
  const { t, isRTL } = useLanguage();
  const { profileImage } = useProfileImage();
  const { content: siteContent } = useSiteContent();
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadCv = async () => {
    setDownloading(true);
    await downloadCvPdf(siteContent.cvFileName || 'Mohamed_Rashed_CV.pdf');
    setDownloading(false);
  };

  const name = isRTL && siteContent.nameAr ? siteContent.nameAr : siteContent.name || 'Mohamed Rashed Abdelazim';
  const role = isRTL && siteContent.titleRoleAr ? siteContent.titleRoleAr : siteContent.titleRole || 'Full-Stack .NET Engineer';
  const location = isRTL && siteContent.locationAr ? siteContent.locationAr : siteContent.location || t('contact.locationValue');
  const bioHeading = isRTL && siteContent.bioHeadingAr ? siteContent.bioHeadingAr : siteContent.bioHeading || t('about.bioHeading');
  const bioP1 = isRTL && siteContent.bioParagraph1Ar ? siteContent.bioParagraph1Ar : siteContent.bioParagraph1 || t('about.bioParagraph1');
  const bioP2 = isRTL && siteContent.bioParagraph2Ar ? siteContent.bioParagraph2Ar : siteContent.bioParagraph2 || t('about.bioParagraph2');
  const bioP3 = isRTL && siteContent.bioParagraph3Ar ? siteContent.bioParagraph3Ar : siteContent.bioParagraph3 || t('about.bioParagraph3');

  const highlights = [
    {
      icon: Briefcase,
      title: isRTL ? 'الخبرة العملية والأنظمة' : 'Professional Engineering',
      text: isRTL
        ? 'أكثر من 3 سنوات في بناء أنظمة .NET إنتاجية تشمل منصات تعليمية، نظم دعم فني في الوقت الفعلي، وإدارة عيادات طبية.'
        : '3+ years architecting production .NET systems — ranging from LMS platforms to real-time helpdesk ticketing and medical clinic management.',
    },
    {
      icon: GraduationCap,
      title: isRTL ? 'الخلفية الأكاديمية' : 'Education & Foundations',
      text: isRTL
        ? 'بكالوريوس في علوم الحاسب مع تركيز على هندسة البرمجيات، هياكل البيانات والأنظمة الموزعة.'
        : 'B.Sc. in Computer Science with a strong focus on software architecture, algorithms, and distributed systems.',
    },
    {
      icon: Sparkles,
      title: isRTL ? 'تقييم الذكاء الاصطناعي' : 'AI Evaluation & RLHF',
      text: isRTL
        ? 'أكثر من 1500 كود برمجي مُولد بالذكاء الاصطناعي تم تدقيقه من حيث الأمان، الأداء، والصحة المنطقية.'
        : '1,500+ AI-generated code snippets evaluated for hallucinated APIs, concurrency flaws, security vulnerabilities, and Clean Architecture adherence.',
    },
    {
      icon: Target,
      title: isRTL ? 'المبدأ الهندسي' : 'Core Architecture Philosophy',
      text: isRTL
        ? 'المعمارية النظيفة تعني حماية منطق الأعمال (Domain Logic) وعزله عن تقلبات البنية التحتية والمكتبات الخارجية.'
        : 'Clean Architecture is fundamentally about isolating core business logic from infrastructure churn, ensuring maintainability and long-term testability.',
    },
  ];

  return (
    <PageTransition title="About — Mohamed Rashed Abdelazim">
      <PageHeader
        title={t('about.title')}
        subtitle={t('about.subtitle')}
      />

      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Summary Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35 }}
                className="card p-6 text-center bg-theme-card border border-theme-border shadow-md"
              >
                <div className="relative w-36 h-36 mx-auto mb-4 group">
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-theme-accent via-theme-accent/50 to-theme-accent-sec rounded-full blur-md opacity-45 group-hover:opacity-75 transition duration-300" />
                  <div className="relative w-36 h-36 rounded-full overflow-hidden ring-4 ring-theme-accent/25 border-2 border-theme-accent shadow-lg bg-slate-950">
                    <img
                      src={profileImage}
                      alt="Mohamed Rashed Abdelazim"
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-theme-text">
                  {name}
                </h2>
                <p className="text-sm font-semibold text-theme-accent mt-1">
                  {role}
                </p>
                <p className="text-xs text-theme-muted mt-1 font-mono">
                  {location}
                </p>

                <div className="mt-5 pt-5 border-t border-theme-border flex flex-wrap justify-center gap-1.5">
                  <span className="badge badge-accent">.NET 8</span>
                  <span className="badge badge-accent">C# 12</span>
                  <span className="badge badge-accent">Clean Architecture</span>
                  <span className="badge badge-accent">EF Core</span>
                  <span className="badge badge-accent">AI Evaluation</span>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadCv}
                    disabled={downloading}
                    className="btn-primary w-full text-xs flex items-center justify-center gap-2 shadow-md"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>{t('about.downloadResume')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCvModalOpen(true)}
                    className="btn-ghost w-full text-xs flex items-center justify-center gap-2"
                  >
                    <Eye className="w-3.5 h-3.5 text-theme-accent" />
                    <span>{isRTL ? 'معاينة الـ CV مباشرة' : 'Preview CV in Viewer'}</span>
                  </button>

                  <div className="pt-3 border-t border-theme-border flex items-center justify-center gap-2">
                    <a
                      href="https://www.linkedin.com/in/mohamed-rashed%E2%80%AC%E2%80%AF-642248283"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 btn-ghost text-xs py-2 flex items-center justify-center gap-1.5 hover:text-theme-accent border border-theme-border"
                      title="LinkedIn Profile"
                    >
                      <Linkedin className="w-3.5 h-3.5 text-theme-accent" />
                      <span>LinkedIn</span>
                    </a>
                    <a
                      href="https://github.com/MohamedRashed1995"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 btn-ghost text-xs py-2 flex items-center justify-center gap-1.5 hover:text-theme-accent border border-theme-border"
                      title="GitHub Profile"
                    >
                      <Github className="w-3.5 h-3.5 text-theme-accent" />
                      <span>GitHub</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Biography & Narrative */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35 }}
                className="card p-6 sm:p-8 bg-theme-card border border-theme-border shadow-sm"
              >
                <h3 className="text-xl font-extrabold text-theme-text mb-4">
                  {bioHeading}
                </h3>
                <div className="space-y-4 text-sm sm:text-base text-theme-text-sec leading-relaxed">
                  <p>{bioP1}</p>
                  <p>{bioP2}</p>
                  <p>{bioP3}</p>
                </div>
              </motion.div>

              {/* Highlights 2x2 Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {highlights.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.06 }}
                    className="card p-5 bg-theme-card border border-theme-border hover:border-theme-accent/50 transition-all duration-200"
                  >
                    <div className="w-9 h-9 rounded-lg bg-theme-accent-light border border-theme-border flex items-center justify-center mb-3">
                      <item.icon className="w-4 h-4 text-theme-accent" />
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-theme-text mb-1.5">
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
                      {item.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CV Preview & Download Modal */}
      <CvPreviewModal isOpen={cvModalOpen} onClose={() => setCvModalOpen(false)} />
    </PageTransition>
  );
}
