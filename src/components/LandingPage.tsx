import { useState } from 'react';
import { GraduationCap, Sparkle, Cloud } from '@phosphor-icons/react';

interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const handleEnter = () => {
    setIsExiting(true);
    // Wait for exit animation to complete before calling onEnter
    setTimeout(() => {
      setIsVisible(false);
      onEnter();
    }, 1500);
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden transition-all duration-1500 backdrop-blur-md ${
      isExiting ? 'opacity-0' : 'opacity-100'
    }`}>
      {/* Background gradient with additional blur overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50/90 via-white/85 to-pink-100/90 dark:from-neutral-950/95 dark:via-neutral-900/90 dark:to-pink-950/30 backdrop-blur-sm" />
      
      {/* Animated background clouds */}
      <div className="absolute inset-0">
        {/* Cloud 1 - Large, slow moving */}
        <div className={`absolute top-20 -left-32 w-64 h-32 transition-transform duration-[20s] ease-linear ${
          isExiting ? 'translate-x-[150vw]' : 'translate-x-[120vw]'
        }`}>
          <div className="w-full h-full bg-gradient-to-r from-[#E91E63]/10 via-[#E91E63]/20 to-[#E91E63]/10 rounded-full blur-xl animate-pulse" />
        </div>
        
        {/* Cloud 2 - Medium, medium speed */}
        <div className={`absolute top-40 -left-24 w-48 h-24 transition-transform duration-[15s] ease-linear delay-300 ${
          isExiting ? 'translate-x-[140vw]' : 'translate-x-[130vw]'
        }`}>
          <div className="w-full h-full bg-gradient-to-r from-[#E91E63]/15 via-[#E91E63]/25 to-[#E91E63]/15 rounded-full blur-lg animate-pulse" />
        </div>
        
        {/* Cloud 3 - Small, fast moving */}
        <div className={`absolute top-60 -left-16 w-32 h-16 transition-transform duration-[12s] ease-linear delay-700 ${
          isExiting ? 'translate-x-[160vw]' : 'translate-x-[140vw]'
        }`}>
          <div className="w-full h-full bg-gradient-to-r from-[#E91E63]/20 via-[#E91E63]/30 to-[#E91E63]/20 rounded-full blur-md animate-pulse" />
        </div>
        
        {/* Cloud 4 - Large, different height */}
        <div className={`absolute top-80 -left-40 w-56 h-28 transition-transform duration-[18s] ease-linear delay-1000 ${
          isExiting ? 'translate-x-[145vw]' : 'translate-x-[125vw]'
        }`}>
          <div className="w-full h-full bg-gradient-to-r from-[#E91E63]/12 via-[#E91E63]/22 to-[#E91E63]/12 rounded-full blur-xl animate-pulse" />
        </div>
        
        {/* Cloud 5 - Bottom cloud */}
        <div className={`absolute bottom-32 -left-28 w-40 h-20 transition-transform duration-[16s] ease-linear delay-500 ${
          isExiting ? 'translate-x-[155vw]' : 'translate-x-[135vw]'
        }`}>
          <div className="w-full h-full bg-gradient-to-r from-[#E91E63]/18 via-[#E91E63]/28 to-[#E91E63]/18 rounded-full blur-lg animate-pulse" />
        </div>
      </div>
      
      {/* Overlay clouds that part when entering - Direct viewport positioning */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Left side clouds - positioned directly from viewport left */}
        {/* Large left cloud covering top-left */}
        <div className={`absolute top-0 w-[35rem] h-80 transition-transform duration-1000 ease-out ${
          isExiting ? '-translate-x-full' : 'translate-x-0'
        }`} style={{ left: '-8rem' }}>
          {/* Cloud icon overlay */}
          <div className="absolute top-8 left-8 z-10">
            <Cloud size={120} className="text-[#E91E63]/30 drop-shadow-lg" />
          </div>
          <div className="absolute top-16 left-24 z-10">
            <Cloud size={100} className="text-[#E91E63]/25 drop-shadow-lg" />
          </div>
          {/* Cloud outline */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#E91E63]/25 via-[#E91E63]/35 to-[#E91E63]/15 rounded-full blur-xl border-2 border-[#E91E63]/40" />
          {/* Cloud fill */}
          <div className="absolute inset-2 bg-gradient-to-br from-[#E91E63]/15 via-[#E91E63]/20 to-transparent rounded-full blur-2xl" />
        </div>
        
        {/* Medium left cloud covering middle-left */}
        <div className={`absolute top-1/3 w-[32rem] h-64 transition-transform duration-1000 ease-out ${
          isExiting ? '-translate-x-full' : 'translate-x-0'
        }`} style={{ left: '-12rem' }}>
          {/* Cloud icon overlay */}
          <div className="absolute top-6 left-12 z-10">
            <Cloud size={110} className="text-[#E91E63]/35 drop-shadow-lg" />
          </div>
          <div className="absolute top-12 left-28 z-10">
            <Cloud size={90} className="text-[#E91E63]/28 drop-shadow-lg" />
          </div>
          {/* Cloud outline */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#E91E63]/30 via-[#E91E63]/40 to-[#E91E63]/20 rounded-full blur-lg border-2 border-[#E91E63]/45" />
          {/* Cloud fill */}
          <div className="absolute inset-2 bg-gradient-to-r from-[#E91E63]/12 via-[#E91E63]/18 to-transparent rounded-full blur-xl" />
        </div>
        
        {/* Bottom left cloud */}
        <div className={`absolute bottom-0 w-[33rem] h-72 transition-transform duration-1000 ease-out ${
          isExiting ? '-translate-x-full' : 'translate-x-0'
        }`} style={{ left: '-10rem' }}>
          {/* Cloud icon overlay */}
          <div className="absolute top-4 left-16 z-10">
            <Cloud size={115} className="text-[#E91E63]/32 drop-shadow-lg" />
          </div>
          <div className="absolute top-16 left-32 z-10">
            <Cloud size={95} className="text-[#E91E63]/26 drop-shadow-lg" />
          </div>
          {/* Cloud outline */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#E91E63]/28 via-[#E91E63]/38 to-[#E91E63]/18 rounded-full blur-xl border-2 border-[#E91E63]/42" />
          {/* Cloud fill */}
          <div className="absolute inset-2 bg-gradient-to-tr from-[#E91E63]/14 via-[#E91E63]/22 to-transparent rounded-full blur-2xl" />
        </div>
        
        {/* Right side clouds - positioned directly from viewport right */}
        {/* Large right cloud covering top-right */}
        <div className={`absolute top-0 w-[35rem] h-80 transition-transform duration-1000 ease-out ${
          isExiting ? 'translate-x-full' : 'translate-x-0'
        }`} style={{ right: '-8rem' }}>
          {/* Cloud icon overlay */}
          <div className="absolute top-8 right-8 z-10">
            <Cloud size={120} className="text-[#E91E63]/30 drop-shadow-lg" />
          </div>
          <div className="absolute top-16 right-24 z-10">
            <Cloud size={100} className="text-[#E91E63]/25 drop-shadow-lg" />
          </div>
          {/* Cloud outline */}
          <div className="absolute inset-0 bg-gradient-to-bl from-[#E91E63]/25 via-[#E91E63]/35 to-[#E91E63]/15 rounded-full blur-xl border-2 border-[#E91E63]/40" />
          {/* Cloud fill */}
          <div className="absolute inset-2 bg-gradient-to-bl from-[#E91E63]/15 via-[#E91E63]/20 to-transparent rounded-full blur-2xl" />
        </div>
        
        {/* Medium right cloud covering middle-right */}
        <div className={`absolute top-1/3 w-[32rem] h-64 transition-transform duration-1000 ease-out ${
          isExiting ? 'translate-x-full' : 'translate-x-0'
        }`} style={{ right: '-12rem' }}>
          {/* Cloud icon overlay */}
          <div className="absolute top-6 right-12 z-10">
            <Cloud size={110} className="text-[#E91E63]/35 drop-shadow-lg" />
          </div>
          <div className="absolute top-12 right-28 z-10">
            <Cloud size={90} className="text-[#E91E63]/28 drop-shadow-lg" />
          </div>
          {/* Cloud outline */}
          <div className="absolute inset-0 bg-gradient-to-l from-[#E91E63]/30 via-[#E91E63]/40 to-[#E91E63]/20 rounded-full blur-lg border-2 border-[#E91E63]/45" />
          {/* Cloud fill */}
          <div className="absolute inset-2 bg-gradient-to-l from-[#E91E63]/12 via-[#E91E63]/18 to-transparent rounded-full blur-xl" />
        </div>
        
        {/* Bottom right cloud */}
        <div className={`absolute bottom-0 w-[33rem] h-72 transition-transform duration-1000 ease-out ${
          isExiting ? 'translate-x-full' : 'translate-x-0'
        }`} style={{ right: '-10rem' }}>
          {/* Cloud icon overlay */}
          <div className="absolute top-4 right-16 z-10">
            <Cloud size={115} className="text-[#E91E63]/32 drop-shadow-lg" />
          </div>
          <div className="absolute top-16 right-32 z-10">
            <Cloud size={95} className="text-[#E91E63]/26 drop-shadow-lg" />
          </div>
          {/* Cloud outline */}
          <div className="absolute inset-0 bg-gradient-to-tl from-[#E91E63]/28 via-[#E91E63]/38 to-[#E91E63]/18 rounded-full blur-xl border-2 border-[#E91E63]/42" />
          {/* Cloud fill */}
          <div className="absolute inset-2 bg-gradient-to-tl from-[#E91E63]/14 via-[#E91E63]/22 to-transparent rounded-full blur-2xl" />
        </div>
        
        {/* Top overlay cloud */}
        <div className={`absolute top-0 left-1/4 right-1/4 h-40 transition-all duration-800 ease-out ${
          isExiting ? 'opacity-0 -translate-y-full scale-150' : 'opacity-100 translate-y-0 scale-100'
        }`}>
          <div className="relative w-full h-full">
            {/* Cloud icon overlay */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
              <Cloud size={80} className="text-[#E91E63]/25 drop-shadow-lg" />
            </div>
            {/* Cloud outline */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#E91E63]/20 via-[#E91E63]/30 to-[#E91E63]/10 rounded-full blur-lg border-2 border-[#E91E63]/35" />
            {/* Cloud fill */}
            <div className="absolute inset-2 bg-gradient-to-b from-[#E91E63]/8 via-[#E91E63]/12 to-transparent rounded-full blur-xl" />
          </div>
        </div>
        
        {/* Bottom overlay cloud */}
        <div className={`absolute bottom-0 left-1/4 right-1/4 h-40 transition-all duration-800 ease-out delay-100 ${
          isExiting ? 'opacity-0 translate-y-full scale-150' : 'opacity-100 translate-y-0 scale-100'
        }`}>
          <div className="relative w-full h-full">
            {/* Cloud icon overlay */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
              <Cloud size={80} className="text-[#E91E63]/25 drop-shadow-lg" />
            </div>
            {/* Cloud outline */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#E91E63]/20 via-[#E91E63]/30 to-[#E91E63]/10 rounded-full blur-lg border-2 border-[#E91E63]/35" />
            {/* Cloud fill */}
            <div className="absolute inset-2 bg-gradient-to-t from-[#E91E63]/8 via-[#E91E63]/12 to-transparent rounded-full blur-xl" />
          </div>
        </div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <div className="w-1 h-1 bg-[#E91E63]/30 rounded-full" />
          </div>
        ))}
      </div>
      
      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-8">
        {/* Logo section */}
        <div className="mb-12 relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-[#E91E63]/20 rounded-full blur-3xl scale-150 animate-pulse" />
          
          {/* Main logo container */}
          <div className="relative bg-gradient-to-br from-white/80 to-white/60 dark:from-neutral-800/80 dark:to-neutral-900/60 backdrop-blur-xl p-8 rounded-3xl border border-white/20 dark:border-neutral-700/20 shadow-2xl">
            <div className="bg-gradient-to-br from-[#E91E63]/15 to-[#E91E63]/5 p-6 rounded-2xl border border-[#E91E63]/10">
              <GraduationCap size={64} className="text-[#E91E63] mx-auto" />
            </div>
          </div>
          
          {/* Floating sparkles around logo */}
          <div className="absolute -top-4 -right-4 animate-bounce delay-300">
            <Sparkle size={20} className="text-[#E91E63]/60" />
          </div>
          <div className="absolute -bottom-2 -left-6 animate-bounce delay-700">
            <Sparkle size={16} className="text-[#E91E63]/40" />
          </div>
          <div className="absolute top-8 -left-8 animate-bounce delay-1000">
            <Sparkle size={12} className="text-[#E91E63]/50" />
          </div>
        </div>
        
        {/* Title and subtitle */}
        <div className="mb-16 space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-[#E91E63] via-[#E91E63]/90 to-[#E91E63]/70 bg-clip-text text-transparent leading-tight">
            Study Pal
          </h1>
          <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-300 font-medium max-w-2xl mx-auto leading-relaxed">
            Your AI-powered study companion is ready to help you learn, grow, and achieve your goals
          </p>
          
          {/* Animated subtitle dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-2 h-2 bg-[#E91E63]/60 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-[#E91E63]/40 rounded-full animate-pulse delay-300" />
            <div className="w-2 h-2 bg-[#E91E63]/60 rounded-full animate-pulse delay-700" />
          </div>
        </div>
        
        {/* Call to action button */}
        <button
          onClick={handleEnter}
          disabled={isExiting}
          className="group relative px-12 py-6 bg-gradient-to-r from-[#E91E63] to-[#E91E63]/80 hover:from-[#E91E63]/90 hover:to-[#E91E63]/70 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-[#E91E63]/25 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {/* Button glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#E91E63] to-[#E91E63]/80 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
          
          {/* Button content */}
          <span className="relative flex items-center gap-3">
            {isExiting ? (
              <>
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Entering...
              </>
            ) : (
              <>
                Meet your Pal!
                <Sparkle size={24} className="group-hover:rotate-12 transition-transform duration-300" />
              </>
            )}
          </span>
        </button>
        
        {/* Bottom hint */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 animate-pulse">
            Click above to start your learning journey
          </p>
        </div>
      </div>
    </div>
  );
}
