import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AuthTab = 'whatsapp' | 'login' | 'register';

interface AuthModalContextType {
  isOpen: boolean;
  activeTab: AuthTab;
  openAuthModal: (tab?: AuthTab) => void;
  closeAuthModal: () => void;
  setActiveTab: (tab: AuthTab) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AuthTab>('whatsapp');

  const openAuthModal = (tab: AuthTab = 'whatsapp') => {
    setActiveTab(tab);
    setIsOpen(true);
  };

  const closeAuthModal = () => {
    setIsOpen(false);
  };

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        activeTab,
        openAuthModal,
        closeAuthModal,
        setActiveTab,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}
