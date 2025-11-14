'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface UserProfile {
  credits: number
  email: string
}

interface GeneratedImage {
  id: string
  prompt: string
  image_url: string
  created_at: string
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.push('/auth/login')
      return
    }

    setUser(session.user)
    await loadProfile(session.user.id)
    await loadImages(session.user.id)
    setLoading(false)
  }

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      setProfile(data)
    }
  }

  const loadImages = async (userId: string) => {
    const { data, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (data) {
      setImages(data)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!profile || profile.credits < 1) {
      setError('Insufficient credits. You need at least 1 credit to generate an image.')
      return
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setGenerating(true)

    try {
      // Call the API route to generate image
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image')
      }

      // Deduct credit
      const newCredits = profile.credits - 1
      await supabase
        .from('user_profiles')
        .update({ credits: newCredits })
        .eq('id', user.id)

      // Save generated image
      await supabase.from('generated_images').insert([
        {
          user_id: user.id,
          prompt: prompt,
          image_url: data.image_url,
        },
      ])

      // Reload data
      await loadProfile(user.id)
      await loadImages(user.id)
      setPrompt('')
    } catch (error: any) {
      setError(error.message || 'Failed to generate image')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">AI Image Generator</h1>
          <div className="flex items-center gap-4">
            <div className="card py-2 px-4">
              <span className="font-semibold">Credits: {profile?.credits || 0}</span>
            </div>
            <button onClick={handleLogout} className="btn-secondary">
              Logout
            </button>
          </div>
        </div>

        {/* Generator */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">Generate Image</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label htmlFor="prompt" className="block mb-2 font-medium">
                Enter your prompt
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="input-field min-h-[100px]"
                placeholder="A beautiful sunset over mountains..."
                required
                disabled={generating}
              />
            </div>

            <button
              type="submit"
              disabled={generating || !profile || profile.credits < 1}
              className="btn-primary w-full"
            >
              {generating ? 'Generating...' : `Generate Image (1 Credit)`}
            </button>
          </form>

          {profile && profile.credits < 1 && (
            <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 rounded-lg">
              You have no credits left. Purchase more credits to continue generating images.
            </div>
          )}
        </div>

        {/* Generated Images Gallery */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Your Generated Images</h2>

          {images.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No images generated yet. Create your first image above!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <div key={image.id} className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <div className="relative aspect-square bg-gray-200 dark:bg-gray-700">
                    <img
                      src={image.image_url}
                      alt={image.prompt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {image.prompt}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {new Date(image.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
