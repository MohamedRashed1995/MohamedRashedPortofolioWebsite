import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Project, SiteContent, TechStackCategory, Inquiry } from '@/types';
import {
  getStoredProjects,
  addProjectToStore,
  updateProjectInStore,
  deleteProjectFromStore,
  resetProjectsStore,
  getStoredSiteContent,
  saveStoredSiteContent,
  resetStoredSiteContent,
  getStoredTechStack,
  addOrUpdateSkill as storageAddSkill,
  deleteSkillFromStore,
  resetStoredTechStack,
  getStoredInquiries,
  addInquiryToStore,
  updateInquiryStatusInStore,
  deleteInquiryFromStore,
  exportAllDataAsJson,
  importAllDataFromJson,
  saveStoredTechStack,
} from '@/services/dataStorage';


interface DataContextType {
  projects: Project[];
  siteContent: SiteContent;
  techStack: TechStackCategory[];
  inquiries: Inquiry[];
  loading: boolean;

  // Projects
  addProject: (project: Project) => void;
  updateProject: (id: string, updated: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  resetProjects: () => void;

  // Site Content
  updateSiteContent: (content: Partial<SiteContent>) => void;
  resetSiteContent: () => void;

  // Tech Stack & Skills
  saveFullTechStack: (stack: TechStackCategory[]) => void;
  addOrUpdateSkill: (category: string, name: string, proficiency: number) => void;
  deleteSkill: (category: string, name: string) => void;
  resetTechStack: () => void;

  // Inquiries
  addInquiry: (input: {
    name: string;
    email: string;
    message: string;
    inquiryType: Inquiry['inquiryType'];
  }) => Inquiry;
  updateInquiryStatus: (id: string, status: 'New' | 'Read' | 'Archived') => void;
  deleteInquiry: (id: string) => void;
  reloadInquiries: () => void;

  // Backup / Reset
  exportBackup: () => string;
  importBackup: (json: string) => boolean;
  resetAllData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => getStoredProjects());
  const [siteContent, setSiteContent] = useState<SiteContent>(() => getStoredSiteContent());
  const [techStack, setTechStack] = useState<TechStackCategory[]>(() => getStoredTechStack());
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => getStoredInquiries());
  const [loading] = useState<boolean>(false);


  // Sync state with custom events across components
  useEffect(() => {
    const handleProjectsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<Project[]>;
      if (customEvent.detail) {
        setProjects(customEvent.detail);
      } else {
        setProjects(getStoredProjects());
      }
    };

    const handleContentUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SiteContent>;
      if (customEvent.detail) {
        setSiteContent(customEvent.detail);
      } else {
        setSiteContent(getStoredSiteContent());
      }
    };

    const handleSkillsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<TechStackCategory[]>;
      if (customEvent.detail) {
        setTechStack(customEvent.detail);
      } else {
        setTechStack(getStoredTechStack());
      }
    };

    const handleInquiriesUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<Inquiry[]>;
      if (customEvent.detail) {
        setInquiries(customEvent.detail);
      } else {
        setInquiries(getStoredInquiries());
      }
    };

    window.addEventListener('portfolio:projects-updated', handleProjectsUpdate);
    window.addEventListener('portfolio:content-updated', handleContentUpdate);
    window.addEventListener('portfolio:skills-updated', handleSkillsUpdate);
    window.addEventListener('portfolio:inquiries-updated', handleInquiriesUpdate);

    return () => {
      window.removeEventListener('portfolio:projects-updated', handleProjectsUpdate);
      window.removeEventListener('portfolio:content-updated', handleContentUpdate);
      window.removeEventListener('portfolio:skills-updated', handleSkillsUpdate);
      window.removeEventListener('portfolio:inquiries-updated', handleInquiriesUpdate);
    };
  }, []);

  // Project Actions
  const addProject = useCallback((project: Project) => {
    const updated = addProjectToStore(project);
    setProjects(updated);
  }, []);

  const updateProject = useCallback((id: string, updatedFields: Partial<Project>) => {
    const updated = updateProjectInStore(id, updatedFields);
    setProjects(updated);
  }, []);

  const deleteProject = useCallback((id: string) => {
    const updated = deleteProjectFromStore(id);
    setProjects(updated);
  }, []);

  const resetProjects = useCallback(() => {
    const reset = resetProjectsStore();
    setProjects(reset);
  }, []);

  // Site Content Actions
  const updateSiteContent = useCallback((content: Partial<SiteContent>) => {
    const updated = saveStoredSiteContent(content);
    setSiteContent(updated);
  }, []);

  const resetSiteContent = useCallback(() => {
    const reset = resetStoredSiteContent();
    setSiteContent(reset);
  }, []);

  // Tech Stack Actions
  const saveFullTechStack = useCallback((stack: TechStackCategory[]) => {
    saveStoredTechStack(stack);
    setTechStack(stack);
  }, []);

  const addOrUpdateSkill = useCallback((category: string, name: string, proficiency: number) => {
    const updated = storageAddSkill(category, name, proficiency);
    setTechStack(updated);
  }, []);

  const deleteSkill = useCallback((category: string, name: string) => {
    const updated = deleteSkillFromStore(category, name);
    setTechStack(updated);
  }, []);

  const resetTechStack = useCallback(() => {
    const reset = resetStoredTechStack();
    setTechStack(reset);
  }, []);

  // Inquiry Actions
  const addInquiry = useCallback(
    (input: {
      name: string;
      email: string;
      message: string;
      inquiryType: Inquiry['inquiryType'];
    }) => {
      const inq = addInquiryToStore(input);
      setInquiries(getStoredInquiries());
      return inq;
    },
    []
  );

  const updateInquiryStatus = useCallback(
    (id: string, status: 'New' | 'Read' | 'Archived') => {
      const updated = updateInquiryStatusInStore(id, status);
      setInquiries(updated);
    },
    []
  );

  const deleteInquiry = useCallback((id: string) => {
    const updated = deleteInquiryFromStore(id);
    setInquiries(updated);
  }, []);

  const reloadInquiries = useCallback(() => {
    setInquiries(getStoredInquiries());
  }, []);

  // Backup & Reset Actions
  const exportBackup = useCallback(() => {
    return exportAllDataAsJson();
  }, []);

  const importBackup = useCallback((json: string) => {
    const success = importAllDataFromJson(json);
    if (success) {
      setProjects(getStoredProjects());
      setSiteContent(getStoredSiteContent());
      setTechStack(getStoredTechStack());
      setInquiries(getStoredInquiries());
    }
    return success;
  }, []);

  const resetAllData = useCallback(() => {
    resetProjectsStore();
    resetStoredSiteContent();
    resetStoredTechStack();
    setProjects(getStoredProjects());
    setSiteContent(getStoredSiteContent());
    setTechStack(getStoredTechStack());
    setInquiries(getStoredInquiries());
  }, []);

  const value = useMemo(
    () => ({
      projects,
      siteContent,
      techStack,
      inquiries,
      loading,
      addProject,
      updateProject,
      deleteProject,
      resetProjects,
      updateSiteContent,
      resetSiteContent,
      saveFullTechStack,
      addOrUpdateSkill,
      deleteSkill,
      resetTechStack,
      addInquiry,
      updateInquiryStatus,
      deleteInquiry,
      reloadInquiries,
      exportBackup,
      importBackup,
      resetAllData,
    }),
    [
      projects,
      siteContent,
      techStack,
      inquiries,
      loading,
      addProject,
      updateProject,
      deleteProject,
      resetProjects,
      updateSiteContent,
      resetSiteContent,
      saveFullTechStack,
      addOrUpdateSkill,
      deleteSkill,
      resetTechStack,
      addInquiry,
      updateInquiryStatus,
      deleteInquiry,
      reloadInquiries,
      exportBackup,
      importBackup,
      resetAllData,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
