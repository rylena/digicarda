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