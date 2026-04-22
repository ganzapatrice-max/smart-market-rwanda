import { db } from "./firebase";
import {
  doc,
  updateDoc,
  increment,
  getDoc
} from "firebase/firestore";

export const completeJob = async (
  jobId: string
) => {
  const jobRef = doc(db, "jobs", jobId);
  const snap = await getDoc(jobRef);

  if (!snap.exists()) return;

  const job = snap.data();

  if (job.status === "paid") return;

  // worker earns
  await updateDoc(
    doc(db, "users", job.workerId),
    {
      balance: increment(job.workerPay),
      totalEarned: increment(job.workerPay),
    }
  );

  // platform earns
  await updateDoc(
    doc(db, "platform", "main"),
    {
      totalRevenue: increment(job.platformFee),
    }
  );

  // mark paid
  await updateDoc(jobRef, {
    status: "paid",
  });
};