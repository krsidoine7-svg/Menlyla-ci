'use client'

import { useEffect } from 'react'

type Theme = {
    primaryColor: string
    secondaryColor?: string
    useGradient?: boolean
}

type Props = {
    theme?: Theme
}

export function ThemeInjector({ theme }: Props) {
    const primaryColor = theme?.primaryColor || '#F97316'
    const secondaryColor = theme?.secondaryColor || '#F97316'
    const useGradient = theme?.useGradient || false

    useEffect(() => {
        if (!primaryColor) return

        const styleId = 'dynamic-theme-styles'
        let styleEl = document.getElementById(styleId) as HTMLStyleElement

        if (!styleEl) {
            styleEl = document.createElement('style')
            styleEl.id = styleId
            document.head.appendChild(styleEl)
        }

        const backgroundValue = useGradient
            ? `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
            : primaryColor

        const cssContent = `
            :root {
                --primary: ${primaryColor};
            }
            
            /* Text - Always use solid primary color for readability */
            .text-primary { color: ${primaryColor} !important; }
            .text-orange-600 { color: ${primaryColor} !important; }
            .text-orange-500 { color: ${primaryColor} !important; }
            .text-orange-700 { color: ${primaryColor} !important; filter: brightness(0.8); }
            .text-orange-950 { color: ${primaryColor} !important; filter: brightness(0.4); }

            /* Backgrounds - Use gradient if enabled */
            .bg-primary { background: ${backgroundValue} !important; }
            .bg-orange-600 { background: ${backgroundValue} !important; }
            .bg-orange-500 { background: ${backgroundValue} !important; }
            
            /* Borders - Use solid primary color */
            .border-primary { border-color: ${primaryColor} !important; }
            .border-orange-600 { border-color: ${primaryColor} !important; }
            .ring-primary { --tw-ring-color: ${primaryColor} !important; }
            
            /* SVG Fills/Strokes - Solid */
            .fill-orange-600 { fill: ${primaryColor} !important; }
            .stroke-orange-600 { stroke: ${primaryColor} !important; }

            /* Light Backgrounds (opacity variants) - Need solid color base */
            .bg-orange-50 { background-color: ${primaryColor}0d !important; }
            .bg-orange-50\\/50 { background-color: ${primaryColor}08 !important; }
            .bg-orange-100 { background-color: ${primaryColor}1a !important; }
            
            .border-orange-100 { border-color: ${primaryColor}1a !important; }
            .border-orange-200 { border-color: ${primaryColor}33 !important; }
            
            /* Shadows - Solid base */
            .shadow-orange-600\\/20 { --tw-shadow-color: ${primaryColor}33 !important; }
            .shadow-orange-600\\/30 { --tw-shadow-color: ${primaryColor}4d !important; }
        `

        styleEl.innerHTML = cssContent

    }, [primaryColor, secondaryColor, useGradient])

    return null
}
