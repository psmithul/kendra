'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronRightIcon,
  StarIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarSolidIcon,
  SparklesIcon as SparklesSolidIcon,
} from '@heroicons/react/24/solid';

const features = [
  {
    icon: SparklesSolidIcon,
    title: 'AI-Powered Matching',
    description: 'Advanced algorithms connect you with the perfect healthcare professionals.',
  },
  {
    icon: CalendarDaysIcon,
    title: 'Smart Scheduling',
    description: 'Seamless coordination for meetings, consultations, and collaborations.',
  },
  {
    icon: UserGroupIcon,
    title: 'Exclusive Networks',
    description: 'Join curated communities where meaningful healthcare discussions thrive.',
  },
  {
    icon: StarSolidIcon,
    title: 'Premium Connections',
    description: 'Build lasting relationships with verified healthcare professionals worldwide.',
  },
];

const stats = [
  { number: '50K+', label: 'Healthcare professionals connected' },
  { number: '98%', label: 'Satisfaction rate' },
  { number: '2M+', label: 'Successful collaborations' },
  { number: '95%', label: 'Users recommend Kendraa' },
];

const testimonials = [
  {
    name: 'Dr. Sarah Chen',
    title: 'Cardiothoracic Surgeon, Johns Hopkins',
    quote: 'Kendraa has revolutionized how I connect with fellow specialists. The AI matching is incredibly accurate.',
    avatar: 'SC',
  },
  {
    name: 'Dr. Michael Rodriguez',
    title: 'Emergency Medicine, Mayo Clinic',
    quote: 'Finally, a platform that understands the unique needs of healthcare professionals.',
    avatar: 'MR',
  },
  {
    name: 'Dr. Emily Thompson',
    title: 'Research Director, Harvard Medical',
    quote: 'The exclusive networks feature is game-changing for meaningful medical collaborations.',
    avatar: 'ET',
  },
  {
    name: 'Dr. Lisa Martinez',
    title: 'Pediatrician, Stanford Health',
    quote: 'Smart scheduling saves me hours every week. Highly recommend!',
    avatar: 'LM',
  },
  {
    name: 'Dr. Chris Brown',
    title: 'Neurologist, Cleveland Clinic',
    quote: 'The AI matching is spot-on. I&apos;ve made more valuable connections here than anywhere else.',
    avatar: 'CB',
  },
  {
    name: 'Dr. Amanda Kim',
    title: 'Oncologist, MD Anderson',
    quote: 'Kendraa understands the difference between networking and building real medical partnerships.',
    avatar: 'AK',
  },
];

const pricingPlans = [
  {
    name: 'Professional',
    price: '$0',
    period: '/month',
    features: [
      'AI-powered matching (standard)',
      'Access to 5 specialty networks',
      '10 connection requests per day',
      'Basic scheduling tools',
      'Join medical events',
      'Community support',
    ],
    buttonText: 'Get Started',
    popular: false,
  },
  {
    name: 'Kendraa Premium',
    price: '$29',
    period: '/month',
    features: [
      'Advanced AI matching',
      'Unlimited specialty networks',
      'Unlimited connections',
      'Smart scheduling',
      'Priority event access',
      'Dedicated support',
    ],
    buttonText: 'Get Premium',
    popular: true,
  },
];

const faqs = [
  {
    question: 'How does Kendraa match healthcare professionals?',
    answer: 'Kendraa uses advanced AI to analyze your specialty, interests, and professional goals, ensuring every connection is relevant and valuable for your medical career.',
  },
  {
    question: 'Is Kendraa free to use?',
    answer: 'Yes, Kendraa offers a free plan with basic features. For advanced features, we offer Kendraa Premium at $29/month.',
  },
  {
    question: 'Can I control who I connect with?',
    answer: 'Absolutely. You have full control over your connections and can choose who to engage with based on your professional preferences.',
  },
  {
    question: 'How secure is my data on Kendraa?',
    answer: 'We prioritize your privacy and security. All data is encrypted and we never share your information with third parties.',
  },
  {
    question: 'Does Kendraa support medical conferences and events?',
    answer: 'Yes, Kendraa integrates with various medical event platforms and helps you connect with attendees before, during, and after events.',
  },
];

const trustedInstitutions = [
  'Johns Hopkins', 'Mayo Clinic', 'Harvard Medical', 'Stanford Health', 'Cleveland Clinic', 'MD Anderson', 'UCLA Health'
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-sm border-b border-purple-500/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Kendraa</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-300 hover:text-purple-400 transition-colors">
                Features
              </Link>
              <Link href="#testimonials" className="text-gray-300 hover:text-purple-400 transition-colors">
                Testimonials
              </Link>
              <Link href="#pricing" className="text-gray-300 hover:text-purple-400 transition-colors">
                Pricing
              </Link>
              <Link href="#faq" className="text-gray-300 hover:text-purple-400 transition-colors">
                FAQs
              </Link>
            </nav>

            {/* CTA Button */}
            <Link
              href="/signup"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/25">
                <SparklesIcon className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              The Royal Network for{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Healthcare</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              AI-powered, premium networking that connects healthcare professionals with the right opportunities and collaborations.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-purple-500/25"
            >
              Get Started for Free
              <ChevronRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>

          {/* Network Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mt-16 relative"
          >
            <div className="flex justify-center items-center space-x-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center border-2 border-purple-400/30 relative shadow-lg"
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-purple-400/20 animate-pulse"></div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-8">Trusted By Leading Medical Institutions</h2>
          <div className="flex justify-center items-center space-x-12 opacity-60">
            {trustedInstitutions.map((institution) => (
              <div key={institution} className="text-gray-300 font-semibold">
                {institution}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-800 to-purple-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Designed for{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Royal Connections</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              With Kendraa, connecting with the right healthcare professionals is effortless, ensuring every interaction has real value.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center bg-gradient-to-br from-slate-800 to-purple-900 rounded-2xl p-6 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Kendraa by the Numbers</h2>
            <p className="text-xl text-gray-300">A glance at how Kendraa is revolutionizing healthcare networking.</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center bg-gradient-to-br from-slate-800 to-purple-900 rounded-2xl p-6 border border-purple-500/20"
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">{stat.number}</div>
                <div className="text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-800 to-purple-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">What our Healthcare Professionals Say</h2>
            <p className="text-xl text-gray-300">Real professionals, real connections. See what they&apos;re saying.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-2xl p-6 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">{testimonial.title}</div>
                  </div>
                </div>
                <p className="text-gray-300">&quot;{testimonial.quote}&quot;</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Premium Plans for Every{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Professional</span>
            </h2>
            <p className="text-xl text-gray-300">Whatever your healthcare networking goals, Kendraa has a plan tailored for you.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`bg-gradient-to-br from-slate-800 to-purple-900 rounded-2xl p-8 border ${
                  plan.popular ? 'border-purple-500 ring-2 ring-purple-500/50' : 'border-purple-500/20'
                }`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckIcon className="w-5 h-5 text-purple-500 mr-3" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-purple-500/25 block text-center"
                >
                  {plan.buttonText}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-800 to-purple-900">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-xl border border-purple-500/20"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-purple-900/20 transition-colors rounded-xl"
                >
                  <span className="font-medium">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUpIcon className="w-5 h-5" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-gray-300">
                    {faq.answer}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Network Like Royalty</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of healthcare professionals using AI-powered networking to build real connections.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-purple-500/25"
            >
              Get Started For Free
              <ChevronRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-800 to-purple-900 border-t border-purple-500/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Kendraa</span>
              </div>
              <p className="text-gray-400">Royal networking, powered by AI.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Navigation</h3>
              <div className="space-y-2">
                <Link href="#features" className="block text-gray-400 hover:text-purple-400 transition-colors">
                  Features
                </Link>
                <Link href="#testimonials" className="block text-gray-400 hover:text-purple-400 transition-colors">
                  Testimonials
                </Link>
                <Link href="#pricing" className="block text-gray-400 hover:text-purple-400 transition-colors">
                  Pricing
                </Link>
                <Link href="#faq" className="block text-gray-400 hover:text-purple-400 transition-colors">
                  FAQs
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect with us</h3>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white">in</span>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white">X</span>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white">D</span>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white">💬</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-purple-500/20 mt-8 pt-8 text-center text-gray-400">
            © 2025 Kendraa. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
