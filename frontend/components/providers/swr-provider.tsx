"use client"

import { SWRConfig } from 'swr'

export function SWRProvider({ children }: { children: React.ReactNode }) {
    return (
        <SWRConfig
            value={{
                // Revalidación automática
                revalidateOnFocus: true,
                revalidateOnReconnect: true,

                // Deduplicación de requests
                dedupingInterval: 2000,

                // Manejo de errores
                shouldRetryOnError: true,
                errorRetryCount: 3,
                errorRetryInterval: 5000,

                // Configuración de caché
                provider: () => new Map(),

                // Opciones globales
                keepPreviousData: true,
            }}
        >
            {children}
        </SWRConfig>
    )
}
