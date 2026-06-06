'use client'
import axios from 'axios'
import { useParams } from 'next/navigation'
import React, { useEffect } from 'react'

const Page = () => {
  const {id} = useParams();
  useEffect(() => {
    const getPartner = async () => {
      try {
        const res = await axios.get(`/api/admin/reviews/partner/${id}`)
        console.log(res)
      } catch (error) {
        console.log(error)
      }
    }
    getPartner();
  }, [])
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
      
    </div>
  )
}

export default Page
