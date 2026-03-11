'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

export function WholesaleHero() {
    return (
        <section>
            <div className="py-24 md:pb-32 lg:pb-36 lg:pt-72">
                <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-6 lg:block lg:px-12">
                    <div className="mx-auto max-w-lg text-center lg:ml-0 lg:max-w-full lg:text-left">
                        <span className="text-[#FF8543] font-bold tracking-widest uppercase text-sm">Our Business</span>
                        <h1 className="mt-4 max-w-2xl text-balance font-serif text-5xl md:text-6xl lg:mt-8 xl:text-7xl font-bold text-white">
                            Wholesale Supply
                        </h1>
                        <p className="mt-8 max-w-2xl text-balance text-lg text-slate-200 font-light">
                            Providing chefs and grocers with uncompromised quality, straight off the boats.
                        </p>

                        <div className="mt-12 flex flex-col items-center justify-center gap-2 sm:flex-row lg:justify-start">
                            <Button
                                asChild
                                size="lg"
                                className="h-12 rounded-full pl-5 pr-3 text-base bg-[#FF8543] hover:bg-[#E2743A]">
                                <Link href="/wholesale/apply">
                                    <span className="text-nowrap">Apply for Wholesale</span>
                                    <ChevronRight className="ml-1" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="ghost"
                                className="h-12 rounded-full px-5 text-base text-white hover:bg-white/10">
                                <Link href="tel:+61755076712">
                                    <span className="text-nowrap">Call Sales Team</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="absolute inset-1 overflow-hidden rounded-3xl border border-white/5 sm:aspect-video lg:rounded-[3rem]">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster="/assets/products/wholesale.webp"
                        className="size-full object-cover opacity-35 lg:opacity-60"
                        src="/assets/wholesale.mp4"
                    />
                </div>
            </div>
        </section>
    )
}
