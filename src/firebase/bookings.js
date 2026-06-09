import {
  collection,
  addDoc
} from "firebase/firestore"

import { db } from "./config"

export const createBooking = async (bookingData) => {

  try {

    const docRef = await addDoc(
      collection(db, "bookings"),
      bookingData
    )

    return {
      success: true,
      id: docRef.id
    }

  } catch (error) {

    return {
      success: false,
      error: error.message
    }
  }
}