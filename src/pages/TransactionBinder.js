import React, { useState, useEffect } from 'react';
import DocumentImage from '../components/DocumentImage'; // Ensure this component correctly handles PDFs
import './TransactionBinder.css'; // Ensure you have this CSS file for styling
import { getInvoicesAndRelatedDocuments, getSignedUrlForS3 } from '../utils/aws-utils'; // Import the correct function

// Mapping menu items to their corresponding classifications
const menuToClassificationMap = {
  'Quote':               'QUOTE',
  'PO':                  'PURCHASE_ORDER',
  'Order Confirmation':  'ORDER_CONFIRMATION',
  'Shipping Doc':        'SHIPPING_DOCUMENT',
  'Inventory Receipt':   'INVENTORY_RECEIPT',
  'Invoice':             'INVOICE',
  'Payment':             'PAYMENT',
  'RMA':                 'RMA',
  'Credit':              'CREDIT',
};

function TransactionBinder() {
  const [selectedSection, setSelectedSection] = useState('Invoice');
  const [invoicesData, setInvoicesData] = useState([]); // State to hold invoices and related documents
  const [currentInvoiceIndex, setCurrentInvoiceIndex] = useState(0); // To track which invoice is being displayed
  const [loading, setLoading] = useState(false); // State to manage loading status
  const [error, setError] = useState(null); // State to handle errors

  // Function to handle section selection
  const handleMenuClick = (section) => {
    setSelectedSection(section);
  };

  // Fetch invoices and related documents when the component loads
  useEffect(() => {
    fetchInvoices();
  }, []);

  // Function to fetch invoices and related documents
  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch invoices and related documents
      const data = await getInvoicesAndRelatedDocuments();
      setInvoicesData(data); // Store the invoices and their related documents in state
    } catch (error) {
      setError('Failed to fetch invoices');
      console.error('Error fetching invoices:', error); // Log full error details for debugging
    } finally {
      setLoading(false);
    }
  };

  // Function to handle next invoice navigation
  const handleNextInvoice = () => {
    if (currentInvoiceIndex < invoicesData.length - 1) {
      setCurrentInvoiceIndex(currentInvoiceIndex + 1);
    }
  };

  // Function to handle previous invoice navigation
  const handlePreviousInvoice = () => {
    if (currentInvoiceIndex > 0) {
      setCurrentInvoiceIndex(currentInvoiceIndex - 1);
    }
  };

  // Get the current invoice and related documents
  const currentInvoiceData = invoicesData[currentInvoiceIndex];
  const selectedClassification = menuToClassificationMap[selectedSection]; // Get the classification based on selected section

  // Find the related document that matches the selected classification
  const currentRelatedDocument = currentInvoiceData?.relatedDocuments.find(
    (doc) => doc.Classification.toUpperCase() === selectedClassification
  );

  // Get the image URL for the current document based on the selected section
  const documentImageUrl = currentRelatedDocument
    ? getSignedUrlForS3(currentRelatedDocument.DocumentID) // Show related document if it matches the section
    : selectedSection === 'Invoice' && currentInvoiceData?.invoice
    ? getSignedUrlForS3(currentInvoiceData.invoice.DocumentID) // Default to showing the invoice
    : '';

  return (
    <div className="transaction-binder-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <ul>
          {Object.keys(menuToClassificationMap).map((item) => (
            <li
              key={item}
              className={selectedSection === item ? 'active' : ''}
              onClick={() => handleMenuClick(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">

        </header>

        {/* Main Section Split into Two Columns */}
        <div className="main-section">
          {/* Left Column - Document Image */}
          <div className="left-column">
            <div className="document-image">
              {loading ? (
                <p>Loading...</p>
              ) : documentImageUrl ? (
                <DocumentImage file={documentImageUrl} /> // Use DocumentImage to render the PDF
              ) : (
                <p>404 - Document Not Found</p>
              )}
              {error && <p className="error">{error}</p>}
            </div>
          </div>

          {/* Right Column - Transaction Details */}
          <div className="right-column">
            <div className="transaction-details">
              <h4>Transaction Details</h4>
              {currentInvoiceData && (
                <>
                  <p>PO Number: {currentInvoiceData.invoice.po_number || 'N/A'}</p>
                  <p>Related Documents:</p>
                  <ul>
                    {currentInvoiceData.relatedDocuments.map((doc, index) => (
                      <li key={index}>{doc.DocumentID || 'No Document ID'}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="footer-navigation">
          <button
            className="cancel-btn"
            onClick={handlePreviousInvoice}
            disabled={currentInvoiceIndex === 0}
          >
            Previous
          </button>
          <button
            className="next-btn"
            onClick={handleNextInvoice}
            disabled={currentInvoiceIndex === invoicesData.length - 1}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransactionBinder;