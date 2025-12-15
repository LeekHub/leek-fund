import React from 'react';

export const AIContext = React.createContext<{
  analyze: (prompt: string) => void;
  openConfig: () => void;
} | null>(null);
