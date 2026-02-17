import { Crown, type LucideIcon } from 'lucide-react'

interface PageHeroProps {
  title: string
  highlightedWord?: string
  subtitle: string
  icon?: LucideIcon
}

export default function PageHero({
  title,
  highlightedWord,
  subtitle,
  icon: Icon = Crown,
}: PageHeroProps) {
  return (
    <div className="bg-burgundy-900 py-8 sm:py-16">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="h-px w-12 bg-gold-500"></div>
          <Icon className="w-6 h-6 text-gold-500" />
          <div className="h-px w-12 bg-gold-500"></div>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
          {highlightedWord ? (
            <>
              {title} <span className="text-gold-500">{highlightedWord}</span>
            </>
          ) : (
            title
          )}
        </h1>
        <p className="text-burgundy-200 text-base sm:text-lg max-w-xl mx-auto">
          {subtitle}
        </p>
      </div>
    </div>
  )
}
