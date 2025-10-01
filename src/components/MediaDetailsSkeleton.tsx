
/**
 * Placeholder for the main movie/TV poster.
 * Uses specific dimensions for desktop to resemble a large poster image.
 */
const PosterSkeleton = () => (
    <div
        className="flex-shrink-0 w-full max-w-[200px] h-[300px] 
                   md:w-[250px] md:h-[368px] 
                   bg-neutral-700 rounded-xl shadow-2xl shadow-neutral-700/50 animate-pulse mx-auto md:mx-0"
    >
        {/* Placeholder for the large image area */}
    </div>
);

/**
 * Reusable component for a single text badge row (e.g., Languages, Genres).
 */
const PillSectionSkeleton = ({ titleWidth = 'w-32', count = 3 }) => (
    <div className="flex flex-col gap-3 animate-pulse">
        {/* Section Title Placeholder */}
        <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-neutral-800 rounded-full"></div> {/* Icon Placeholder */}
            <div className={`h-4 ${titleWidth} bg-neutral-700 rounded`}></div> {/* Title text */}
        </div>

        {/* Pills / Badges Container */}
        <div className="flex flex-wrap gap-2">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    // Mimicking the dark pill style
                    className="h-8 w-20 sm:w-28 bg-neutral-800 rounded-full px-4 py-2 flex items-center justify-center"
                >
                    <div className="h-3 w-4/5 bg-neutral-700 rounded"></div>
                </div>
            ))}
        </div>
    </div>
);

/**
 * MinimalMediaSkeleton Component
 * Renders a loading skeleton for a minimalist, text-centric movie/TV detail page,
 * now featuring a prominent poster.
 * @param {('movie' | 'tv')} mediaType - Prop for future conditional rendering (e.g., episode count).
 */
const MinimalMediaSkeleton = ({ mediaType = 'movie' }) => {

    // 1. Placeholder for the primary metadata row (Date, Rating, Duration, Bookmark)
    const MetadataSectionSkeleton = () => (
        <section className="flex flex-col sm:flex-row flex-wrap gap-3 animate-pulse justify-center md:justify-start">
            {/* Date Pill */}
            <div className="h-10 w-40 bg-neutral-900 rounded-full flex items-center justify-center border border-neutral-800">
                <div className="h-4 w-3/5 bg-neutral-700 rounded"></div>
            </div>
            {/* Rating Pill */}
            <div className="h-10 w-40 bg-neutral-900 rounded-full flex items-center justify-center border border-neutral-800">
                <div className="h-4 w-3/5 bg-neutral-700 rounded"></div>
            </div>
            {/* Duration Pill (Only for movies/duration-based content) */}
            {mediaType === 'movie' && (
                <div className="h-10 w-40 bg-neutral-900 rounded-full flex items-center justify-center border border-yellow-600/50 ring-1 ring-yellow-600">
                    <div className="h-4 w-3/5 bg-yellow-700 rounded"></div>
                </div>
            )}
            {/* Bookmark Pill */}
            <div className="h-10 w-40 bg-neutral-900 rounded-full flex items-center justify-center border border-neutral-800">
                <div className="h-4 w-3/5 bg-neutral-700 rounded"></div>
            </div>
        </section>
    );

    return (
        <div className="w-full min-h-screen bg-black text-white p-4 sm:p-8 lg:p-16 flex flex-col items-center">
            
            {/* Main Content Area (Full Width) */}
            <div className="w-full flex flex-col gap-12">
                
                {/* Primary Header Block: Poster + Text/Metadata (Stacked on mobile, row on desktop) */}
                <div className="flex flex-col md:flex-row gap-8 w-full max-w-7xl mx-auto">
                    
                    {/* Poster (Left on Desktop, Top-Center on Mobile) */}
                    <PosterSkeleton />

                    {/* Text/Metadata (Right on Desktop, Below Poster on Mobile) */}
                    <div className="flex flex-col flex-grow items-center md:items-start max-w-4xl">
                        {/* 1. Title and Tagline Section */}
                        <header className="text-center md:text-left pt-12 md:pt-0 animate-pulse w-full">
                            {/* Title Placeholder */}
                            <div className="h-12 sm:h-20 w-3/4 max-w-lg mx-auto md:mx-0 bg-neutral-700 rounded-lg mb-4"></div>
                            {/* Tagline Placeholder */}
                            <div className="h-6 w-2/3 max-w-xs mx-auto md:mx-0 bg-neutral-800 rounded"></div>
                        </header>

                        {/* 2. Metadata Pills (Stack on Mobile, Row on Desktop) */}
                        <div className="flex justify-center md:justify-start pt-6 w-full">
                            <MetadataSectionSkeleton />
                        </div>
                    </div>
                </div>

                {/* --- Rest of the Content (Description, Pill Sections) --- */}
                {/* Using max-w-4xl for readability of large text blocks */}
                <div className="w-full max-w-4xl mx-auto flex flex-col gap-12">
                    
                    {/* 3. Description Section */}
                    <section className="animate-pulse w-full mt-8">
                        {/* Description Title */}
                        <div className="h-6 w-32 bg-neutral-700 rounded mb-4 mx-auto sm:mx-0"></div>
                        
                        {/* Description Body */}
                        <div className="space-y-3">
                            <div className="h-4 bg-neutral-800 rounded w-full"></div>
                            <div className="h-4 bg-neutral-800 rounded w-full"></div>
                            <div className="h-4 bg-neutral-800 rounded w-11/12"></div>
                            <div className="h-4 bg-neutral-800 rounded w-3/4"></div>
                        </div>
                    </section>
                    
                    {/* 4. Detail Pills Sections (Languages, Genres, etc.) */}
                    <div className="flex flex-col gap-8">
                        <PillSectionSkeleton titleWidth="w-24" count={3} />
                        <PillSectionSkeleton titleWidth="w-20" count={4} />
                        <PillSectionSkeleton titleWidth="w-40" count={3} />
                        <PillSectionSkeleton titleWidth="w-32" count={2} />
                    </div>
                    
                    {/* 5. Spacer for fixed mobile button */}
                    <div className="h-20 sm:h-4"></div>
                </div>
            </div>

            {/* Fixed Mobile Button Placeholder (Watch Trailer) */}
            <div className="fixed bottom-0 left-0 right-0 p-4 sm:hidden z-20">
                <div className="w-full h-14 bg-blue-700 rounded-lg shadow-2xl shadow-blue-500/50 flex items-center justify-center animate-pulse">
                     <div className="h-5 w-1/3 bg-blue-500 rounded"></div>
                </div>
            </div>
        </div>
    );
};

export default MinimalMediaSkeleton;
