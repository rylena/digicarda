'use client'

import Image from 'next/image'
import { Card } from '@/types/database'
import QRCodeComponent from './QRCode'
import { useState } from 'react'

interface CardDisplayProps {
  card: Card
  baseUrl: string
}

export default function CardDisplay({ card, baseUrl }: CardDisplayProps) {
  const [showContact, setShowContact] = useState(false)
  const cardUrl = `${baseUrl}/${card.username}`

  const getBackgroundClasses = () => {
    if (card.background_type === 'gradient' && card.background_value) {
      return `bg-gradient-to-br ${card.background_value}`
    }
    return ''
  }

  const getBackgroundInlineStyle = () => {
    if (card.background_type === 'color' && card.background_value) {
      return { backgroundColor: card.background_value }
    } else if (card.background_type === 'image' && card.background_value) {
      return { backgroundImage: `url('${card.background_value}')`, backgroundSize: 'cover', backgroundPosition: 'center' }
    }
    return {}
  }

  const backgroundClasses = getBackgroundClasses()
  const backgroundStyle = getBackgroundInlineStyle()

  return (
    <div className={`w-full max-w-md mx-auto rounded-2xl shadow-xl overflow-hidden animate-fade-in ${card.dark_mode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
      {/* Top Section - Profile Picture, Name, Username */}
      <div
        className={`p-8 text-center relative overflow-hidden rounded-t-2xl ${backgroundClasses}`}
        style={backgroundStyle}
      >
        {card.background_type === 'image' && card.background_value && (
          <div className="absolute inset-0 bg-black opacity-40"></div> // Overlay for image backgrounds
        )}
        <div className="relative z-10"> {/* Ensure content is above overlay */}
          <div className="relative w-32 h-32 mx-auto mb-4">
            {card.profile_picture_url ? (
              <Image
                src={card.profile_picture_url}
                alt={card.name}
                fill
                className="rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-4xl font-bold text-blue-500 border-4 border-white shadow-lg">
                {card.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{card.name}</h1>
          <p className="text-blue-100 text-sm">@{card.username}</p>
          {card.position && card.position.map((pos, index) => (
            <p key={index} className="text-blue-100 text-xs mt-1">
              {pos}
            </p>
          ))}
        </div>
      </div>

      {/* Middle Section - Contact Icons */}
      <div className="p-6">
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {card.emails && card.emails.length > 0 && (
            <a
              href={`mailto:${card.emails[0]}`}
              className={`flex items-center justify-center w-12 h-12 rounded-full ${card.dark_mode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-red-100 text-red-600 hover:bg-red-200'} transition-colors`}
              title={`Email: ${card.emails[0]}`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </a>
          )}

          {card.phone_numbers && card.phone_numbers.length > 0 && (
            <a
              href={`tel:${card.phone_numbers[0]}`}
              className={`flex items-center justify-center w-12 h-12 rounded-full ${card.dark_mode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-green-100 text-green-600 hover:bg-green-200'} transition-colors`}
              title={`Phone: ${card.phone_numbers[0]}`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </a>
          )}

          {card.whatsapp && (
            <a
              href={`https://wa.me/${card.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center w-12 h-12 rounded-full ${card.dark_mode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-green-100 text-green-600 hover:bg-green-200'} transition-colors`}
              title={`WhatsApp: ${card.whatsapp}`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </a>
          )}

          {card.instagram && (
            <a
              href={`https://instagram.com/${card.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center w-12 h-12 rounded-full ${card.dark_mode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-pink-100 text-pink-600 hover:bg-pink-200'} transition-colors`}
              title={`Instagram: @${card.instagram.replace('@', '')}`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          )}

          {card.location && (
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full ${card.dark_mode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'} transition-colors cursor-pointer`}
              title={`Location: ${card.location}`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Images Gallery */}
        {card.images && card.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-6">
            {card.images.map((image, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={image}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Contact Button */}
        <button
          onClick={() => setShowContact(!showContact)}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all transform hover:scale-105 mb-4
            ${card.dark_mode
              ? 'bg-gray-700 text-gray-100 hover:bg-gray-600'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
            }`}
        >
          {showContact ? 'Hide Contact' : 'Contact'}
        </button>

        {/* Expanded Contact Info */}
        {showContact && (
          <div className="space-y-3 animate-fade-in">
            {card.emails && card.emails.length > 0 && (
              <div>
                <p className={`text-sm font-semibold ${card.dark_mode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Email:</p>
                {card.emails.map((email, index) => (
                  <a
                    key={index}
                    href={`mailto:${email}`}
                    className={`text-sm ${card.dark_mode ? 'text-blue-400' : 'text-blue-600'} hover:underline block`}
                  >
                    {email}
                  </a>
                ))}
              </div>
            )}

            {card.phone_numbers && card.phone_numbers.length > 0 && (
              <div>
                <p className={`text-sm font-semibold ${card.dark_mode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Phone:</p>
                {card.phone_numbers.map((phone, index) => (
                  <a
                    key={index}
                    href={`tel:${phone}`}
                    className={`text-sm ${card.dark_mode ? 'text-blue-400' : 'text-blue-600'} hover:underline block`}
                  >
                    {phone}
                  </a>
                ))}
              </div>
            )}

            {card.whatsapp && (
              <div>
                <p className={`text-sm font-semibold ${card.dark_mode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>WhatsApp:</p>
                <a
                  href={`https://wa.me/${card.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm ${card.dark_mode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                >
                  {card.whatsapp}
                </a>
              </div>
            )}

            {card.instagram && (
              <div>
                <p className={`text-sm font-semibold ${card.dark_mode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Instagram:</p>
                <a
                  href={`https://instagram.com/${card.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm ${card.dark_mode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                >
                  @{card.instagram.replace('@', '')}
                </a>
              </div>
            )}

            {card.location && (
              <div>
                <p className={`text-sm font-semibold ${card.dark_mode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Location:</p>
                <p className={`text-sm ${card.dark_mode ? 'text-gray-400' : 'text-gray-600'}`}>{card.location}</p>
              </div>
            )}
          </div>
        )}

        {/* QR Code */}
        <div className={`flex justify-center mt-6 pt-6 border-t ${card.dark_mode ? 'border-gray-700' : 'border-gray-200'}`}>
          <QRCodeComponent 
            url={cardUrl} 
            size={150} 
            fgColor={card.dark_mode ? '#ffffff' : '#000000'} // Adjust QR code color for dark mode
            bgColor={card.dark_mode ? '#1f2937' : '#ffffff'} // Adjust QR code background for dark mode
          />
        </div>
      </div>

      {/* Bottom Section - Footer */}
      <div className={`py-4 text-center border-t ${card.dark_mode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        <a
          href="/signup"
          className={`text-sm ${card.dark_mode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors`}
        >
          Create your SterlingCards.
        </a>
      </div>
    </div>
  )
}

