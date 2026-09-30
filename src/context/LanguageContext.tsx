"use client"
import React, { createContext, useContext, useState } from 'react';

type Language = 'es' | 'en';

type LanguageContextType = {
    lang: Language;
    setLang: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType>({
    lang: 'es',
    setLang: () => {},
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [lang, setLang] = useState<Language>('es');

    return (
        <LanguageContext.Provider value={{ lang, setLang }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
