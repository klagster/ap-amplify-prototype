import React, { useState, useEffect } from 'react';
import { updateClassificationInDynamoDB } from '../utils/aws-utils';  // Import the update function

const ClassificationResult = ({ s3Path, confidence, onClassificationUpdate }) => {
  const [documentType, setDocumentType] = useState("NOT_SELECTED");
  const [updating, setUpdating] = useState(false);

  // Reset documentType to "NOT_SELECTED" whenever a new document (s3Path) is displayed
  useEffect(() => {
    setDocumentType("NOT_SELECTED");
  }, [s3Path]);  // Runs every time s3Path changes

  const handleUpdate = async () => {
    setUpdating(true);

    // Debugging: Log the s3Path and new classification
    console.log("Updating classification for s3Path (DocumentID):", s3Path);
    console.log("New Classification:", documentType);

    if (!s3Path) {
      alert('s3Path is missing. Unable to update.');
      setUpdating(false);
      return;
    }

    try {
      await updateClassificationInDynamoDB(s3Path, documentType);  // Update the classification in DynamoDB
      alert('Classification updated successfully');

      // Call the callback function to update the classification in the parent component
      onClassificationUpdate(documentType);

    } catch (error) {
      console.error('Error updating classification:', error);
      alert('Error updating classification');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="classification-result">
      <div className="classification-info">
        <h4>Classification Result</h4>
        <div className="result-item">
          <span>Classification:</span>
          <span>{documentType === "NOT_SELECTED" ? "Not classified yet" : documentType}</span>  {/* Display "Not classified yet" if not selected */}
        </div>
        <div className="result-item">
          <span>Confidence:</span>
          <span>{confidence || "N/A"}</span>  {/* Display "N/A" if no confidence */}
        </div>
      </div>

      <div className="classification-dropdown">
        <h4>Classification Selection</h4>
        <select 
          value={documentType} 
          onChange={(e) => setDocumentType(e.target.value)}
        >
          <option value="NOT_SELECTED">Not Selected</option>  {/* Default to "Not Selected" */}
          <option value="SALES_QUOTATION">Sales Quote</option>
          <option value="PO">PO</option>
          <option value="ORDER_CONFIRMATION">Order Confirmation</option>
          <option value="SHIPPING_DOCUMENT">Shipping Document</option>
          <option value="PACKING_SLIP">Packing Slip</option>
          <option value="INVENTORY_RECEIPT">Inventory Receipt</option>
          <option value="INVOICE">Invoice</option>
          <option value="PAYMENT">Payment</option>
          <option value="RMA">RMA</option>
          <option value="CREDIT">Credit</option>
          <option value="NC">Not AP</option>
        </select>
        <button className="update-btn" onClick={handleUpdate} disabled={updating}>
          {updating ? 'Updating...' : 'Update'}
        </button>
      </div>
    </div>
  );
};

export default ClassificationResult;