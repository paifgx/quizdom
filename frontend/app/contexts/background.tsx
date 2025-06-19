import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface BackgroundContextType {
  backgroundImage: string;
  setBackgroundImage: (image: string) => void;
  resetToDefault: () => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

const DEFAULT_BACKGROUND = '/background/background_pink.png';

interface BackgroundProviderProps {
  children: ReactNode;
}

/**
 * Background provider that manages the current background image
 * for the main layout
 */
export function BackgroundProvider({ children }: BackgroundProviderProps) {
  const [backgroundImage, setBackgroundImageState] = useState(DEFAULT_BACKGROUND);

  const setBackgroundImage = (image: string) => {
    setBackgroundImageState(image);
  };

  const resetToDefault = () => {
    setBackgroundImageState(DEFAULT_BACKGROUND);
  };

  return (
    <BackgroundContext.Provider value={{
      backgroundImage,
      setBackgroundImage,
      resetToDefault,
    }}>
      {children}
    </BackgroundContext.Provider>
  );
}

/**
 * Hook to use the background context
 */
export function useBackground() {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
} 