'use client'
import { IBooking } from '@/model/booking.model'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

const Page = () => {
  const [booking, setBooking] = useState<IBooking | null>(null)
  useEffect(() => {
    const getActiveRides = async () => {
      try {
        const {data} = await axios.get('/api/partner/bookings/active-ride')
        console.log(data.booking)
        if(data.success) {
          setBooking(data.booking)
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.log(error.response?.data?.message)
        } else {
          console.log(error)
        }
      }
    }

    getActiveRides();
  }, [])

  return (
    <div>
      Active Ride here
    </div>
  )
}

export default Page
