import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About SterlingCards</h1>
            <p className="text-xl text-gray-600">
              Your personal digital card generator
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What is SterlingCards?</h2>
              <p>
                SterlingCards is a modern, DIY digital card generator that allows you to create
                a beautiful personal profile card with a unique link and QR code. Share your
                contact information, social media profiles, and more in one elegant, shareable card.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Unique URL:</strong> Each card gets a custom URL like
                  sterlingcards.com/yourusername
                </li>
                <li>
                  <strong>QR Code:</strong> Generate a QR code that links directly to your card
                </li>
                <li>
                  <strong>Multiple Contact Methods:</strong> Add emails, phone numbers, WhatsApp,
                  Instagram, and location
                </li>
                <li>
                  <strong>Image Gallery:</strong> Showcase multiple images on your card
                </li>
                <li>
                  <strong>Clean Design:</strong> Beautiful, minimal card layout that looks great on
                  any device
                </li>
                <li>
                  <strong>Easy Sharing:</strong> Share your card with a simple link or QR code
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>Sign up for a free account</li>
                <li>Create your personal digital card</li>
                <li>Add your contact information and social media links</li>
                <li>Customize your card with profile pictures and images</li>
                <li>Share your unique link or QR code with others</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Started</h2>
              <p>
                Ready to create your own digital card? It's free and takes just a few minutes to
                set up.
              </p>
              <div className="mt-6">
                <Link
                  href="/signup"
                  className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  Create Your Card
                </Link>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'About Us - SterlingCards',
  description: 'Learn about SterlingCards, the DIY digital card generator',
}

