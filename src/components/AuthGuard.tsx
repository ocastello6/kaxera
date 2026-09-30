"use client"
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const sessionResult = useSession() || {};
    const { data: session, status } = sessionResult as any;
    const { isLoaded } = useFinance();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated' && pathname !== '/login') {
            router.push('/login');
        } else if (status === 'authenticated' && pathname === '/login') {
            router.push('/dashboard');
        }
    }, [status, pathname, router]);

    if (status === 'loading' || !isLoaded) {
        return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-800"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    if (status === 'unauthenticated' && pathname !== '/login') {
        return null; 
    }

    return <>{children}</>;
}
