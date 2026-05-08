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
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20 space-y-20">
        
        {/* Hero Section */}
        <section className="flex flex-col gap-12 justify-between">
          <div className="max-w-2xl space-y-6">
            <h2 className="text-5xl md:text-6xl font-medium tracking-tight text-slate-900 leading-[1.1]">
              Waste to Wealth pathway
            </h2>
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed">
              Connecting the supply of upcyclable textiles with conscious fashion firms.
            </p>
            
            {/* Bold, Italic, Quoted Text */}
            <p className="text-xl md:text-2xl font-bold italic text-slate-800 py-2">
              &quot;Upcycle for a cleaner tomorrow&quot;
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-4">
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

        {/* Why Upcycling Section */}
        <section className="p-10 md:p-14 rounded-[2rem] bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-6 uppercase">
            Why Upcycling
          </h3>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-4xl">
            India generates nearly 7.8 million tons of textile waste annually, much of it ending up in landfills. We turn the discarded textiles into upcycled apparel raw materials by enabling traceability, collaboration and market access for every stakeholder in the upcycled apparel ecosystem.
          </p>
        </section>

        {/* ESG & SDGs Contribution Section */}
        <section className="space-y-8">
          {/* Highlighted CTA Banner */}
          <div className="bg-[#2B2640] text-white p-8 md:p-10 rounded-[2rem] shadow-lg text-center flex items-center justify-center">
            <h3 className="text-2xl md:text-3xl font-bold tracking-widest uppercase">
              Join our hands to contribute to ESG & SDGs
            </h3>
          </div>

          {/* Action Bullet Points */}
          <div className="flex flex-col gap-4">
            
            {/* Item 1: Registration Form */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:p-8 bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 gap-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
              <div className="flex items-center gap-4">
                <span className="min-w-[8px] h-2 rounded-full bg-[#2B2640]"></span>
                <span className="text-lg text-slate-800 font-medium leading-tight">
                  Be a part of the Upcycled apparel ecosystem
                </span>
              </div>
              <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLSdmmMjbnL-aKTHf_-tXVC683QHR-_Ac-mWv4YDF3hEniecy7w/viewform?usp=publish-editor" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-semibold bg-[#F9F9FB] hover:bg-slate-200 px-6 py-3 rounded-full text-[#2B2640] transition-colors whitespace-nowrap self-start md:self-auto"
              >
                Registration Form <span>→</span>
              </a>
            </div>

            {/* Item 2: Learn More (MoT) */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:p-8 bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 gap-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
              <div className="flex items-center gap-4">
                <span className="min-w-[8px] h-2 rounded-full bg-[#2B2640]"></span>
                <span className="text-lg text-slate-800 font-medium leading-tight">
                  Here you can get MoT &quot;Upcycled Textile Manufacturer&quot; Certificate
                </span>
              </div>
              <Link 
                href="https://www.upmade.org/certification" 
                className="flex items-center gap-2 text-sm font-semibold bg-[#F9F9FB] hover:bg-slate-200 px-6 py-3 rounded-full text-[#2B2640] transition-colors whitespace-nowrap self-start md:self-auto"
              >
                Learn More <span>→</span>
              </Link>
            </div>

            {/* Item 3: PDF Download (SWM Rules) */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:p-8 bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 gap-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
              <div className="flex items-center gap-4">
                <span className="min-w-[8px] h-2 rounded-full bg-[#2B2640]"></span>
                <span className="text-lg text-slate-800 font-medium leading-tight">
                  New Solid Waste Management (SWM) Rules 2026
                </span>
              </div>
              <a 
                href="/SWM_2026.pdf" 
                download="SWM_2026.pdf" 
                className="flex items-center gap-2 text-sm font-semibold bg-[#F9F9FB] hover:bg-slate-200 px-6 py-3 rounded-full text-[#2B2640] transition-colors whitespace-nowrap self-start md:self-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                PDF Download
              </a>
            </div>

          </div>
        </section>

        {/* Action/Use Cases Section */}
        <section className="grid md:grid-cols-2 gap-8">
          {/* Buyer Card */}
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

          {/* Seller Card */}
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
