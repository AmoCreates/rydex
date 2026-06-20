'use client'
import axios from 'axios';
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const Page = () => {
  const {id} = useParams();
  const [vehicleData, setVehicleData] = useState();
  const [partnerData, setPartnerData] = useState();

  useEffect(() => {
    const getData = async () => {
      try{
      const {data} = await axios.get(`/api/admin/reviews/vehicle/${id}`)
      console.log(data)
      setVehicleData(data.vehicle)
      setPartnerData(data.partner)
      } catch(error) {
        console.log(error);
      }
    }
    getData();
  },[id])

  return (
    <div>
      Welcome
    </div>
  )
}

export default Page
