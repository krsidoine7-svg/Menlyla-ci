'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'

interface SecretInputProps {
    defaultValue?: string
    value?: string
    onChange?: (val: string) => void
    placeholder?: string
}

export function SecretInput({ defaultValue, value, onChange, placeholder }: SecretInputProps) {
    const [show, setShow] = useState(false)

    return (
        <div className="flex gap-2 w-full">
            <Input 
                defaultValue={defaultValue} 
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                type={show ? "text" : "password"} 
                placeholder={placeholder} 
                className="h-11 rounded-xl bg-white/5 border-white/10 font-mono text-xs text-white placeholder:text-white/20 focus-visible:ring-red-500/50 w-full" 
            />
            <Button 
                type="button"
                variant="outline" 
                onClick={() => setShow(!show)}
                className="h-11 px-6 rounded-xl border-slate-200 font-black text-slate-600 uppercase tracking-widest text-[10px] gap-2 shrink-0 w-[120px]"
            >
                {show ? (
                    <>
                        <EyeOff className="h-3 w-3" /> Masquer
                    </>
                ) : (
                    <>
                        <Eye className="h-3 w-3" /> Afficher
                    </>
                )}
            </Button>
        </div>
    )
}
