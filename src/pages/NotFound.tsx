import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { useLanguage } from '@/context/LanguageContext';

export default function NotFound() {
  const { isRTL } = useLanguage();

  return (
    <PageTransition title="Page Not Found — Mohamed Rashed Abdelazim">
      <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 pt-16">
        <div className="text-center max-w-md card p-8 bg-theme-card border border-theme-border shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-theme-accent-light border border-theme-border flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-theme-accent" />
          </div>
          <h1 className="text-4xl font-extrabold text-theme-text mb-2 font-mono">404</h1>
          <p className="text-sm text-theme-muted mb-6">
            {isRTL
              ? 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.'
              : 'The requested resource could not be found or has been moved.'}
          </p>
          <Link to="/" className="btn-primary inline-flex">
            <Home className="w-4 h-4" />
            <span>{isRTL ? 'العودة للرئيسية' : 'Return to Home'}</span>
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
