'use client'
import axios from 'axios'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const Page = () => {
  const {id} = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => {
    const getPartner = async () => {
      try {
        const {data} = await axios.get(`/api/admin/reviews/partner/${id}`)
        console.log(data)
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
