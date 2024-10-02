import React, { useState, useEffect } from 'react';
import DocumentImage from '../components/DocumentImage';
import ClassificationResult from '../components/ClassificationResult';
import FooterNavigation from '../components/FooterNavigation';
import { fetchPdfFilesAndClassificationFromDynamoDB, getSignedUrlForS3 } from '../utils/aws-utils';
import './DocumentReview.css'; // Ensure you have this CSS file for styling

function DocumentReview() {
  const [currentPdfIndex, setCurrentPdfIndex] = useState(0);
  const [pdfFilesState, setPdfFilesState] = useState([]);  // Store the list of PDF files
  const [loading, setLoading] = useState(true);

  // Fetch PDF files when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch PDF files and classifications from DynamoDB
        const pdfFilesWithClassification = await fetchPdfFilesAndClassificationFromDynamoDB();
        
        // Generate signed URLs for each PDF file from S3
        const pdfDataWithUrls = pdfFilesWithClassification.map(item => ({
          ...item,
          url: getSignedUrlForS3(item.s3Path),  // Generate signed URLs
        }));
        
        setPdfFilesState(pdfDataWithUrls);  // Store the files in state
      } catch (error) {
        console.error('Error fetching PDFs:', error);
      } finally {
        setLoading(false);  // Stop loading after the fetch
      }
    };

    fetchData();
  }, []);  // Only run once when the component mounts

  const handleNext = () => {
    if (currentPdfIndex < pdfFilesState.length - 1) {
      setCurrentPdfIndex(currentPdfIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPdfIndex > 0) {
      setCurrentPdfIndex(currentPdfIndex - 1);
    }
  };

  // Handle classification update and remove the current document from the list
  const handleClassificationUpdate = (newClassification) => {
    const updatedPdfFiles = [...pdfFilesState];
    updatedPdfFiles[currentPdfIndex].classification = newClassification;

    // Remove the current document from the list
    const filteredPdfFiles = updatedPdfFiles.filter((_, index) => index !== currentPdfIndex);

    // Update state with the remaining documents
    setPdfFilesState(filteredPdfFiles);

    // Adjust current index if necessary
    if (currentPdfIndex >= filteredPdfFiles.length && currentPdfIndex > 0) {
      setCurrentPdfIndex(currentPdfIndex - 1);
    }
  };

  if (loading) {
    return <div>Loading PDF files...</div>;
  }

  if (pdfFilesState.length === 0) {
    return <div>All documents have been updated and removed from the list.</div>;
  }

  const currentPdf = pdfFilesState[currentPdfIndex];
  const { url, s3Path, classification, confidence } = currentPdf;

  return (
    <div className="app-container">
      <h3>Document & Classification Review ({pdfFilesState.length} Documents)</h3>
      <div className="main-layout">
        <div className="document-section">
          <DocumentImage file={url} />  {/* Pass the file URL to DocumentImage */}
        </div>
        <div className="classification-section">
          <ClassificationResult 
            s3Path={s3Path} 
            classification={classification} 
            confidence={confidence} 
            onClassificationUpdate={handleClassificationUpdate} 
          />
        </div>
      </div>
      <div className="document-info-section">
        <p>Currently viewing: {url}</p>
      </div>
      <FooterNavigation
        onPrevious={handlePrevious}
        onNext={handleNext}
        disablePrevious={currentPdfIndex === 0}
        disableNext={currentPdfIndex === pdfFilesState.length - 1}
      />
    </div>
  );
}

export default DocumentReview;