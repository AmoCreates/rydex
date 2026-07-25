'use client'
import axios from 'axios'
import React, { useEffect } from 'react'

const Page = () => {
  useEffect(() => {
    const getActiveRides = async () => {
      try {
        const {data} = await axios.get('/api/partner/bookings/active-ride')
        console.log(data.booking)
      } catch (error) {
        console.log(error);
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
