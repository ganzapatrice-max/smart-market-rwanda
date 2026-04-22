import { db } from "./firebase";
import { doc, updateDoc, increment } from "firebase/firestore";

export const addEarning = async (
  uid: string,
  amount: number
) => {
  await updateDoc(doc(db, "users", uid), {
    balance: increment(amount),
    totalEarned: increment(amount),
  });
};