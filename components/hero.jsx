"use client";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { ArrowRight, Zap, BarChart3, Shield } from "lucide-react";

const HeroSection = () => {
  const imageRef = useRef();

  useEffect(() => {
    const imageElement = imageRef.current;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="pt-32 pb-20 px-4">
      <div className="container mx-auto text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 px-4 py-2 rounded-full">
          <Zap className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
            AI-Powered Finance Management
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl pb-6 font-bold gradient-title leading-tight">
          Manage Your Finances <br /> <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">with Intelligence</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
          An AI-powered personal finance app that helps you budget, track expenses, and achieve your financial goals with ease. Get insights, automate tracking, and take control of your money.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Link href="/sign-up">
            <Button size="lg" className="px-8 bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-700 hover:to-teal-600 text-white shadow-lg text-lg">
              Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/about">
            <Button size="lg" variant="outline" className="px-8 text-lg border-2 border-indigo-200 dark:border-indigo-800">
              Learn More
            </Button>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 md:grid-cols-3 gap-4 mb-16 max-w-2xl mx-auto">
          <div className="flex flex-col items-center">
            <Shield className="w-6 h-6 text-indigo-600 mb-2" />
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Bank-Level Security</p>
          </div>
          <div className="flex flex-col items-center">
            <BarChart3 className="w-6 h-6 text-teal-500 mb-2" />
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Real-Time Analytics</p>
          </div>
          <div className="flex flex-col items-center">
            <Zap className="w-6 h-6 text-indigo-600 mb-2" />
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Instant Insights</p>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="hero-image-wrapper relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-teal-500/20 rounded-2xl blur-3xl"></div>
          <div ref={imageRef} className="hero-image relative z-10">
            <Image
              src={"/bg.png"}
              width={1200}
              height={800}
              alt="dashboard preview"
              className="rounded-2xl shadow-2xl mx-auto border border-indigo-200 dark:border-indigo-800 max-w-5xl w-full"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
