import HeroSection from "@/components/hero";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { featuresData, howItWorksData, statsData, testimonialsData } from "@/data/landing";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div>
      <HeroSection />

      {/* Trust Indicators */}
      <section className="py-16 bg-gradient-to-r from-indigo-50 via-teal-50 to-indigo-50 border-b border-indigo-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((stat, index) => (
              <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your finances with intelligent insights and automated tracking
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature, index) => (
              <div 
                key={index} 
                className="group p-8 rounded-xl bg-white border border-indigo-100 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="p-3 w-14 h-14 rounded-lg bg-gradient-to-br from-indigo-100 to-teal-100 mb-6 group-hover:from-indigo-200 group-hover:to-teal-200 transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-indigo-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksData.map((step, index) => (
              <div key={index} className="relative">
                {/* Connecting Line */}
                {index < howItWorksData.length - 1 && (
                  <div className="hidden md:block absolute top-20 left-1/2 w-full h-1 bg-gradient-to-r from-indigo-300 to-transparent transform translate-x-1/2"></div>
                )}
                
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-teal-500 flex items-center justify-center mx-auto mb-6 text-white shadow-lg">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
                Loved by Users
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See what our users have to say about Mney
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsData.map((testimonial, index) => (
              <div 
                key={index}
                className="p-8 rounded-xl bg-white border border-indigo-100 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-teal-400">★</span>
                  ))}
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                
                <div className="flex items-center">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-indigo-600">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Mney */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-indigo-50 to-teal-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Why Choose
                <span className="block bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
                  Mney?
                </span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We're committed to providing you with the best financial management experience.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: <Shield className="w-5 h-5" />, text: "Bank-level security with end-to-end encryption" },
                  { icon: <Zap className="w-5 h-5" />, text: "Lightning-fast performance and instant updates" },
                  { icon: <Check className="w-5 h-5" />, text: "24/7 customer support and community help" },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-100 to-teal-100 text-indigo-600 mt-1 flex-shrink-0">
                      {item.icon}
                    </div>
                    <p className="text-gray-700 text-lg">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-teal-500 rounded-2xl blur-3xl opacity-10"></div>
              <div className="relative bg-gradient-to-br from-white to-indigo-50 p-12 rounded-2xl border border-indigo-200">
                <div className="text-center">
                  <div className="text-6xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text mb-2">
                    100%
                  </div>
                  <p className="text-gray-600 text-lg mb-8">
                    Free to get started
                  </p>
                  <div className="space-y-2 text-left text-gray-700">
                    <p>✓ No credit card required</p>
                    <p>✓ No hidden fees</p>
                    <p>✓ Cancel anytime</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about Mney
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                question: "Is my data secure?",
                answer: "Yes, we use bank-level encryption (AES-256) and comply with international security standards. Your data is never shared with third parties."
              },
              {
                question: "Can I export my data?",
                answer: "Absolutely! You can export all your transactions and reports in CSV or PDF format at any time."
              },
              {
                question: "Do you offer mobile apps?",
                answer: "We're working on iOS and Android apps. Currently, our web app is fully responsive and works great on mobile devices."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, PayPal, and bank transfers. Plans start at just $9.99/month."
              },
              {
                question: "Can I cancel anytime?",
                answer: "Yes! Cancel your subscription anytime with no penalties or hidden fees."
              },
              {
                question: "Do you offer team plans?",
                answer: "Yes, we offer team plans for families and small businesses. Contact our sales team for custom pricing."
              },
            ].map((faq, index) => (
              <div key={index} className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-900 hover:border-indigo-400 transition-colors">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Privacy Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: "🔐",
                title: "End-to-End Encrypted",
                description: "All your data is encrypted both in transit and at rest using military-grade encryption."
              },
              {
                icon: "✅",
                title: "Compliance Certified",
                description: "We comply with GDPR, CCPA, and other international data protection regulations."
              },
              {
                icon: "🛡️",
                title: "Regular Security Audits",
                description: "Our infrastructure undergoes regular third-party security audits and penetration testing."
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
                Simple, Transparent Pricing
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "Free",
                features: ["Basic expense tracking", "Limited reports", "Single account", "Community support"],
                highlighted: false
              },
              {
                name: "Professional",
                price: "$9.99",
                period: "/month",
                features: ["Advanced analytics", "Unlimited reports", "Multiple accounts", "Priority support", "Budget planning", "Receipt scanner"],
                highlighted: true
              },
              {
                name: "Business",
                price: "$24.99",
                period: "/month",
                features: ["All Pro features", "Team collaboration", "API access", "Custom integrations", "Dedicated support", "Advanced security"],
                highlighted: false
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={`rounded-xl p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-gradient-to-br from-indigo-600 to-teal-500 text-white shadow-2xl scale-105"
                    : "bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900 hover:border-indigo-400"
                }`}
              >
                {plan.highlighted && (
                  <div className="text-sm font-semibold bg-white/20 w-fit px-3 py-1 rounded-full mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? "text-white" : "text-gray-900 dark:text-white"}`}>
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.highlighted ? "text-white" : "text-gray-900 dark:text-white"}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={plan.highlighted ? "text-indigo-100" : "text-gray-600 dark:text-gray-400"}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <Button
                  size="lg"
                  className={`w-full mb-8 ${
                    plan.highlighted
                      ? "bg-white text-indigo-600 hover:bg-indigo-50"
                      : "bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-700 hover:to-teal-600 text-white"
                  }`}
                >
                  Get Started
                </Button>
                <ul className={`space-y-3 ${plan.highlighted ? "text-indigo-50" : "text-gray-600 dark:text-gray-400"}`}>
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-lg">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-indigo-600 via-indigo-600 to-teal-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Finances?
          </h2>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
            Join thousands of users who are already managing their money smarter with Mney. Start your free trial today—no credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold text-lg px-10 shadow-xl"
              >
                Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 font-semibold text-lg px-10"
              >
                Learn More
              </Button>
            </Link>
          </div>

          <p className="text-indigo-200 mt-8 text-sm">
            🎉 Special offer: Get 1 month free when you sign up this month!
          </p>
        </div>
      </section>
    </div>
  );
}
