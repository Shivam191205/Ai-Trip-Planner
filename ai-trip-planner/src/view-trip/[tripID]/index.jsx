import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/service/firebaseConfig';
import { toast } from 'sonner'
import InfoSection from '../components/InfoSection';
import Hotels from '../components/Hotels';
import PlacesToVisit from '../components/PlacesToVisit';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

function ViewTrip() {
  const {tripID}=useParams();
  const [trip, setTrip] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const parseTripData = (tripData) => {
    if (!tripData) return null;
    if (typeof tripData === 'object') return tripData;

    let raw = String(tripData).trim();
    const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*)\s*```$/i);
    if (codeBlockMatch) {
      raw = codeBlockMatch[1].trim();
    }

    const firstBrace = raw.indexOf('{');
    const lastBrace = raw.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      raw = raw.slice(firstBrace, lastBrace + 1);
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      console.error('Failed to parse tripData JSON:', error, raw);
      return null;
    }
  };

    useEffect(()=>{
        tripID&&getTripData();
    },[tripID])

    //Used to get Trip information from the firebase
    const getTripData=async()=>{
        const docRef=doc(db,"trips",tripID);
        const docSnap=await getDoc(docRef);

        if(docSnap.exists()){
            const data = docSnap.data();
            console.log("Document data:", data);
            const parsedTripData = parseTripData(data.tripData);
            setTrip({ ...data, tripData: parsedTripData ?? data.tripData });
        }else{
            console.log("No such document!");
            toast('No trip found')
        }
        //fetch data from firebase using tripID
    }
  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    setIsPrinting(true);

    // Wait a short delay for React state updates and itinerary rendering to expand
    await new Promise((resolve) => setTimeout(resolve, 800));

    const element = document.getElementById("trip-details-container");
    if (!element) {
      toast.error("Could not find the trip content to download.");
      setPdfLoading(false);
      setIsPrinting(false);
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 1.5, // optimal quality vs size
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      const imgWidth = 210; // A4 size width in mm
      const pageHeight = 297; // A4 size height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const doc = new jsPDF("p", "mm", "a4");
      let position = 0;

      // Add the first page
      doc.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if height exceeds A4 height
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const destination = trip?.userSelection?.location || "Trip";
      const filename = `${destination.toLowerCase().replace(/[^a-z0-9]/g, "_")}_itinerary.pdf`;
      doc.save(filename);
      toast.success("PDF Itinerary downloaded successfully!");
    } catch (error) {
      console.error("PDF download error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setPdfLoading(false);
      setIsPrinting(false);
    }
  };

  return (
    <div className='w-full min-h-screen travel-bg-ambient py-12 px-4 sm:px-10 md:px-20 lg:px-32 xl:px-44 flex flex-col items-center'>
      <div 
        id="trip-details-container" 
        className='max-w-5xl w-full bg-white rounded-3xl p-6 md:p-12 shadow-2xl border border-slate-100 flex flex-col gap-10 relative'
      >
        <InfoSection 
          trip={trip} 
          isPrinting={isPrinting} 
          onDownloadPDF={handleDownloadPDF} 
          pdfLoading={pdfLoading} 
        />
        <Hotels trip={trip} isPrinting={isPrinting} />
        <PlacesToVisit trip={trip} isPrinting={isPrinting} />
      </div>

      {pdfLoading && (
        <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center animate-fade-in'>
          <div className='bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl border border-slate-100 flex flex-col items-center gap-4'>
            <div className='w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin'></div>
            <h3 className='font-bold text-gray-900 text-lg mt-2'>Generating PDF Brochure</h3>
            <p className='text-xs text-gray-500 leading-relaxed'>
              Compiling your personalized travel plan and high-resolution visuals. Please wait...
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewTrip
