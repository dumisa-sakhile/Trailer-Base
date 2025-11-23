import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ViewStore {
    lastViewedMovie: { id: number; name: string } | null
    lastViewedTV: { id: number; name: string } | null
    setLastViewedMovie: (id: number, name: string) => void
    setLastViewedTV: (id: number, name: string) => void
}

const useLastViewedStore = create<ViewStore>()(
    persist(
        (set) => ({
            lastViewedMovie: null,
            lastViewedTV: null,
            setLastViewedMovie: (id, name) =>
                set({ lastViewedMovie: { id, name } }),
            setLastViewedTV: (id, name) =>
                set({ lastViewedTV: { id, name } }),
        }),
        {
            name: 'last-viewed',
        }
    )
)

export default useLastViewedStore