import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ProfileImageProvider } from '@/context/ProfileImageContext';
import { DataProvider } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import About from '@/pages/About';
import TechStack from '@/pages/TechStack';
import AiLab from '@/pages/AiLab';
import Contact from '@/pages/Contact';
import AdminDashboard from '@/pages/AdminDashboard';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ProfileImageProvider>
          <DataProvider>
            <BrowserRouter>
              <div className="min-h-screen flex flex-col bg-surface text-slate-100 antialiased selection:bg-accent-primary/20 selection:text-accent-primary">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/projects/:slug" element={<ProjectDetail />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/tech-stack" element={<TechStack />} />
                    <Route path="/ai-lab" element={<AiLab />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </BrowserRouter>
          </DataProvider>
        </ProfileImageProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;


