"use client";

import React from 'react';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

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
        gradient: 'from-emerald-50 to-white',
        border: 'border-emerald-200',
        glow: 'shadow-emerald-900/5',
        iconColor: 'text-emerald-600',
        badge: 'bg-emerald-100 text-emerald-700',
        pillColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
        id: 'medium',
        title: 'Standard',
        description: 'IDs + Contact Info',
        items: ['Aadhaar', 'PAN', 'Passport', 'DL', 'Phone'],
        icon: ShieldAlert,
        gradient: 'from-amber-50 to-white',
        border: 'border-amber-300',
        glow: 'shadow-amber-900/5',
        iconColor: 'text-amber-600',
        badge: 'bg-amber-100 text-amber-700',
        pillColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
        id: 'high',
        title: 'Maximum',
        description: 'All PII masked',
        items: ['Aadhaar', 'PAN', 'Passport', 'DL', 'Voter ID', 'Phone', 'Email', 'DOB', 'Bank A/C', 'IFSC'],
        icon: ShieldCheck,
        gradient: 'from-rose-50 to-white',
        border: 'border-rose-200',
        glow: 'shadow-rose-900/5',
        iconColor: 'text-rose-600',
        badge: 'bg-rose-100 text-rose-700',
        pillColor: 'bg-rose-50 text-rose-700 border-rose-200',
    },
];

export function RedactionConfig({ selectedLevel, onSelectLevel, onProceed, fileName }: RedactionConfigProps) {
    return (
        <div className="space-y-8 animate-in delay-100">
            {/* Section Header */}
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-extrabold text-slate-900">Choose Redaction Level</h2>
                <p className="text-slate-500 font-medium">
                    Select how much information to mask in <span className="text-indigo-600 font-bold">{fileName}</span>
                </p>
            </div>

            {/* Level Cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {levels.map((level) => {
                    const isSelected = selectedLevel === level.id;
                    const Icon = level.icon;

                    return (
                        <button
                            key={level.id}
                            onClick={() => onSelectLevel(level.id)}
                            className={`
                                relative group text-left p-6 rounded-3xl transition-all duration-300
                                border bg-white
                                hover:-translate-y-1 hover:shadow-xl
                                ${isSelected
                                    ? `bg-gradient-to-b ${level.gradient} ${level.border} shadow-lg ${level.glow} ring-2 ring-indigo-500/20`
                                    : 'border-slate-200 hover:border-slate-300 shadow-sm shadow-slate-200/50'
                                }
                            `}
                        >
                            {/* Selected indicator */}
                            {isSelected && (
                                <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${level.iconColor} animate-pulse`}>
                                    <div className={`w-3 h-3 rounded-full bg-current`} />
                                </div>
                            )}

                            <div className="space-y-5">
                                <div className={`inline-flex p-3 rounded-2xl ${isSelected ? level.badge : 'bg-slate-100'}`}>
                                    <Icon className={`w-7 h-7 ${isSelected ? level.iconColor : 'text-slate-400'}`} />
                                </div>

                                <div>
                                    <h3 className={`text-xl font-bold mb-1 ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                                        {level.title}
                                    </h3>
                                    <p className={`text-sm font-semibold mb-4 ${isSelected ? level.iconColor : 'text-slate-500'}`}>
                                        {level.description}
                                    </p>
                                    
                                    {/* PII type pills */}
                                    <div className="flex flex-wrap gap-2">
                                        {level.items.map((item) => (
                                            <span
                                                key={item}
                                                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                                                    isSelected ? level.pillColor : 'bg-slate-50 text-slate-500 border-slate-200'
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
            <div className="flex justify-center pt-6 text-center">
                <button
                    onClick={onProceed}
                    disabled={!selectedLevel}
                    className={`
                        px-10 py-4 rounded-full font-bold text-base transition-all duration-300 flex items-center gap-2
                        ${selectedLevel
                            ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-slate-900/30 hover:-translate-y-1'
                            : 'bg-slate-100 border text-slate-400 cursor-not-allowed'
                        }
                    `}
                >
                    Review Document →
                </button>
            </div>
        </div>
    );
}
