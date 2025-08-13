import type { ReactNode } from 'react';
import { getDictionary } from '@repo/internationalization';
import { UserHeaderClient } from '../components/user-header/userHeaderClient';
import Image from 'next/image';
import logo from '@/app/public/logo.png';

type AdminLayoutProps = {
    readonly children: ReactNode;
    readonly params: Promise<{
        locale: string;
    }>;
};

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
    const { locale } = await params;
    const dictionary = await getDictionary(locale);

    return (
        <div className="flex w-full min-h-screen bg-barfer-white text-gray-900">
            <UserHeaderClient
                logo={<Image src={logo} alt="Barfer" width={32} height={32} />}
                title="Barfer - Tienda"
                dictionary={dictionary}
                locale={locale}
            />

            <div className="pt-16 flex w-full h-full">
                <main className="bg-gradient-to-br from-barfer-white to-gray-50 flex-1 min-h-screen pb-20 md:pb-0">
                    {children}
                </main>
            </div>
        </div>
    );
} 