export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className="flex items-center justify-center p-4">
      <div
        className={`${sizes[size]} border-4 border-woohwa-green/30 border-t-woohwa-green rounded-full animate-spin`}
        role="status"
        aria-label="로딩 중"
      />
    </div>
  )
}
