"use client";

import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, CreditCard, Phone, Mail, Calendar, Fingerprint, FileText, Car } from 'lucide-react';

interface RedactionConfigProps {
    selectedLevel: string;
    onSelectLevel: (level: string) => void;
    onProceed: () => void;
    fileName: string;
}

const levels = [
    {
        id: 'low',
        title: 'Basic',
        description: 'Aadhaar & PAN only',
        items: ['Aadhaar Number', 'PAN Card'],
        icon: Shield,
        gradient: 'from-emerald-500/20 to-emerald-600/5',
        border: 'border-emerald-500/40',
        glow: 'shadow-emerald-500/20',
        iconColor: 'text-emerald-400',
        badge: 'bg-emerald-500/15 text-emerald-400',
        pillColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
        id: 'medium',
        title: 'Standard',
        description: 'IDs + Contact Info',
        items: ['Aadhaar', 'PAN', 'Passport', 'DL', 'Phone'],
        icon: ShieldAlert,
        gradient: 'from-amber-500/20 to-amber-600/5',
        border: 'border-amber-500/40',
        glow: 'shadow-amber-500/20',
        iconColor: 'text-amber-400',
        badge: 'bg-amber-500/15 text-amber-400',
        pillColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
        id: 'high',
        title: 'Maximum',
        description: 'All PII detected & masked',
        items: ['Aadhaar', 'PAN', 'Passport', 'DL', 'Voter ID', 'Phone', 'Email', 'DOB', 'Bank A/C', 'IFSC'],
        icon: ShieldCheck,
        gradient: 'from-rose-500/20 to-rose-600/5',
        border: 'border-rose-500/40',
        glow: 'shadow-rose-500/20',
        iconColor: 'text-rose-400',
        badge: 'bg-rose-500/15 text-rose-400',
        pillColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
];

export function RedactionConfig({ selectedLevel, onSelectLevel, onProceed, fileName }: RedactionConfigProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Section Header */}
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Choose Redaction Level</h2>
                <p className="text-gray-400 text-sm">
                    Select how much information to mask in <span className="text-blue-400 font-medium">{fileName}</span>
                </p>
            </div>

            {/* Level Cards */}
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {levels.map((level) => {
                    const isSelected = selectedLevel === level.id;
                    const Icon = level.icon;

                    return (
                        <button
                            key={level.id}
                            onClick={() => onSelectLevel(level.id)}
                            className={`
                                relative group text-left p-6 rounded-2xl transition-all duration-300
                                border backdrop-blur-md
                                ${isSelected
                                    ? `bg-gradient-to-b ${level.gradient} ${level.border} shadow-lg ${level.glow}`
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                }
                            `}
                        >
                            {/* Selected indicator */}
                            {isSelected && (
                                <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${level.iconColor} animate-pulse`}>
                                    <div className={`w-3 h-3 rounded-full bg-current`} />
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className={`inline-flex p-3 rounded-xl ${isSelected ? level.badge : 'bg-white/10'}`}>
                                    <Icon className={`w-6 h-6 ${isSelected ? level.iconColor : 'text-gray-400'}`} />
                                </div>

                                <div>
                                    <h3 className={`text-lg font-semibold mb-1 ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                                        {level.title}
                                    </h3>
                                    <p className={`text-sm font-medium mb-3 ${isSelected ? level.iconColor : 'text-gray-400'}`}>
                                        {level.description}
                                    </p>
                                    
                                    {/* PII type pills */}
                                    <div className="flex flex-wrap gap-1.5">
                                        {level.items.map((item) => (
                                            <span
                                                key={item}
                                                className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                                    isSelected ? level.pillColor : 'bg-white/5 text-gray-500 border-white/10'
                                                }`}
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Proceed Button */}
            <div className="flex justify-center">
                <button
                    onClick={onProceed}
                    disabled={!selectedLevel}
                    className={`
                        px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-300
                        ${selectedLevel
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-105'
                            : 'bg-white/10 text-gray-500 cursor-not-allowed'
                        }
                    `}
                >
                    Redact & Download →
                </button>
            </div>
        </div>
    );
}
