'use client'

import { SignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

export default function SignUpPage() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard')
    }
  }, [isLoaded, isSignedIn, router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-dark-text-primary mb-2">
            Create Your Account
          </h1>
          <p className="text-dark-text-secondary">
            Join NestWise and start your investing journey
          </p>
        </div>
        <div className="flex justify-center">
          <SignUp
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'bg-dark-card border border-dark-border shadow-lg',
                headerTitle: 'text-dark-text-primary',
                headerSubtitle: 'text-dark-text-secondary',
                socialButtonsBlockButton: 'bg-dark-surface hover:bg-dark-card border border-dark-border text-dark-text-primary',
                formButtonPrimary: 'bg-dark-accent-green hover:bg-dark-accent-green/90',
                formFieldInput: 'bg-dark-surface border-dark-border text-dark-text-primary',
                formFieldLabel: 'text-dark-text-secondary',
                footerActionLink: 'text-dark-accent-green',
                identityPreviewText: 'text-dark-text-primary',
                identityPreviewEditButton: 'text-dark-accent-green',
              },
            }}
            routing="path"
            path="/auth/signup"
            signInUrl="/auth/signin"
          />
        </div>
      </div>
    </div>
  )
}
