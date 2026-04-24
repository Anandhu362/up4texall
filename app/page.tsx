'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'seller') {
        router.push('/seller/dashboard');
      } else {
        router.push('/buyer/products');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9FB]">
        <div className="animate-pulse">
          <div className="text-2xl font-medium text-slate-800">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans antialiased bg-[#F9F9FB] text-slate-600">
      {/* Header/Logo Section */}
      <header className="py-6 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image
              src="/r_logo.png"
              alt="Up4TexAll Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Up4TexAll</h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20 space-y-24">
        
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row gap-12 items-center justify-between">
          <div className="md:w-1/2 space-y-6">
            <h2 className="text-5xl md:text-6xl font-medium tracking-tight text-slate-900 leading-[1.1]">
              Waste to Wealth pathway
            </h2>
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-lg">
              Connecting the supply of upcyclable textiles with conscious fashion firms. Upcycle for a cleaner tomorrow.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link
                href="/login?role=buyer"
                className="px-8 py-3.5 text-base font-medium rounded-full bg-[#2B2640] text-white text-center transition-all duration-300 hover:bg-[#1E1A2F] hover:shadow-lg hover:-translate-y-0.5"
              >
                I am here to Buy
              </Link>
              <Link
                href="/login?role=seller"
                className="px-8 py-3.5 text-base font-medium rounded-full bg-white text-[#2B2640] border border-slate-200 text-center transition-all duration-300 hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                I am here to Sell
              </Link>
            </div>
          </div>
        </section>

        {/* 3-Card Ecosystem Section (Modeled after the reference image cards) */}
        <section className="grid md:grid-cols-3 gap-6">
          {/* Light Card */}
          <div className="p-10 rounded-[2rem] bg-[#EAE6F5] flex flex-col justify-between min-h-[320px] transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div>
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-2xl font-medium text-slate-900 mb-2">Eco-Friendly Supply</h3>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Give materials a second life. Reduce environmental impact, one purchase at a time.
            </p>
          </div>

          {/* Dark Card 1 */}
          <div className="p-10 rounded-[2rem] bg-[#2B2640] flex flex-col justify-between min-h-[320px] transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div>
              <div className="text-4xl mb-4 opacity-90">✨</div>
              <h3 className="text-2xl font-medium text-white mb-2">Curated Materials</h3>
            </div>
            <p className="text-[#B4AECC] leading-relaxed">
              Discover rare textiles. Find unique fabrics that tell a story of transformation.
            </p>
          </div>

          {/* Dark Card 2 */}
          <div className="p-10 rounded-[2rem] bg-[#2B2640] flex flex-col justify-between min-h-[320px] transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div>
              <div className="text-4xl mb-4 opacity-90">🤝</div>
              <h3 className="text-2xl font-medium text-white mb-2">Traceable Economy</h3>
            </div>
            <p className="text-[#B4AECC] leading-relaxed">
              Join verified creators. Support sustainable business practices and conscious consumption.
            </p>
          </div>
        </section>

        {/* Action/Use Cases Section (Modeled after the "Business" section) */}
        <section className="grid md:grid-cols-2 gap-8">
          {/* White Card with Soft Shadow */}
          <div className="p-10 md:p-14 rounded-[2rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <h2 className="text-3xl font-medium tracking-tight text-slate-900 mb-4">For Buyers</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Boost your sustainable output by easily sourcing upcycled materials. Browse unique products, track orders, and manage everything effortlessly on our platform.
            </p>
            <ul className="space-y-4 mb-10 text-slate-600">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2B2640]"></span> Advanced filtering
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2B2640]"></span> Verified reviews
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2B2640]"></span> Real-time order tracking
              </li>
            </ul>
            <Link href="/signup?role=buyer" className="flex items-center gap-2 text-sm font-medium text-slate-900 hover:text-[#5F558C] transition-colors">
              <span>→</span> Start Shopping
            </Link>
          </div>

          <div className="p-10 md:p-14 rounded-[2rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <h2 className="text-3xl font-medium tracking-tight text-slate-900 mb-4">For Sellers</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Turn your textile waste into capital. List your unused fabrics and connect directly with businesses looking to upcycle materials.
            </p>
            <ul className="space-y-4 mb-10 text-slate-600">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2B2640]"></span> Detailed product listings
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2B2640]"></span> Inventory dashboard
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2B2640]"></span> Customer relationship tools
              </li>
            </ul>
            <Link href="/signup?role=seller" className="flex items-center gap-2 text-sm font-medium text-slate-900 hover:text-[#5F558C] transition-colors">
              <span>→</span> Start Selling
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight text-slate-900">Up4TexAll</span>
          </div>
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Up4TexAll. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}