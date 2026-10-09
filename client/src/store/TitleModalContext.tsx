import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MediaItem, Movie, Series } from '../types';

interface TitleModalContextType {
  isOpen: boolean;
  activeItem: MediaItem | Movie | Series | null;
  openModal: (item: MediaItem | Movie | Series | any) => void;
  closeModal: () => void;
}

const TitleModalContext = createContext<TitleModalContextType | undefined>(undefined);

export const TitleModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<MediaItem | Movie | Series | null>(null);

  const openModal = (item: MediaItem | Movie | Series | any) => {
    setActiveItem(item);
    setIsOpen(true);
    // Prevent body scrolling while modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsOpen(false);
    setActiveItem(null);
    document.body.style.overflow = 'unset';
  };

  return (
    <TitleModalContext.Provider value={{ isOpen, activeItem, openModal, closeModal }}>
      {children}
    </TitleModalContext.Provider>
  );
};

export function useTitleModal() {
  const context = useContext(TitleModalContext);
  if (!context) {
    throw new Error('useTitleModal must be used within a TitleModalProvider');
  }
  return context;
}
