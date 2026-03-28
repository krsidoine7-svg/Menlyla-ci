'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'

interface SecretInputProps {
    defaultValue?: string
    placeholder?: string
}

export function SecretInput({ defaultValue, placeholder }: SecretInputProps) {
    const [show, setShow] = useState(false)

    return (
        <div className="flex gap-2 w-full">
            <Input 
                defaultValue={defaultValue} 
                type={show ? "text" : "password"} 
                placeholder={placeholder} 
                className="h-11 rounded-xl bg-slate-50 border-slate-200 font-mono text-xs focus-visible:ring-emerald-500 w-full" 
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
