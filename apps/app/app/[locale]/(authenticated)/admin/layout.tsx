import type { ReactNode } from 'react';
import { getDictionary } from '@repo/internationalization';
import { AdminLayoutClient } from './components/admin-layout-client';
import Image from 'next/image';
import Link from 'next/link';
import logo from '@/app/public/barfer.png';

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
        <AdminLayoutClient
            logo={
                <Link href={`/${locale}`}>
                    <Image src={logo} alt="RAW" width={32} height={32} className="cursor-pointer hover:opacity-80 transition-opacity" />
                </Link>
            }
            title="RAW - Tienda"
            dictionary={dictionary}
            locale={locale}
        >
            {children}
        </AdminLayoutClient>
    );
} 