'use client';
import axios from 'axios';
import React, { useEffect } from 'react'

const AdminDashboard = () => {
  useEffect(() => {
      const fetchData = async () => {
        try {
          const {data} = await axios.get('/api/admin/dashboard');
          console.log(data);
        } catch (error) {
          console.log(error)
        }
      }

      fetchData();
  }, [])

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 pt-28 px-4 pb-20">
      Admin Dashboard

    </div>
  )
}

export default AdminDashboard