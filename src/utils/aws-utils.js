import AWS from 'aws-sdk';

// Set AWS credentials and region in code

// Explicitly set AWS credentials from environment variables
AWS.config.update({
  region: process.env.REACT_APP_AWS_REGION,
  credentials: new AWS.Credentials(
    process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
  )
});
console.log('AWS Access Key:', process.env.REACT_APP_AWS_ACCESS_KEY_ID);
console.log('AWS Secret Access Key:', process.env.REACT_APP_AWS_SECRET_ACCESS_KEY);
console.log('AWS Region:', process.env.REACT_APP_AWS_REGION);

// Initialize AWS SDK components
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

/**
 * Fetch PDF files and their associated classification data from DynamoDB
 * @returns {Promise<Array>} List of items with S3 paths and classification data
 */
export const fetchPdfFilesAndClassificationFromDynamoDB = async () => {
  const params = {
    TableName: 'ap-document',  // Replace with your DynamoDB table name
    FilterExpression: 'Stage = :stage',
    ExpressionAttributeValues: {
      ':stage': 'REVIEW',
    },
  };

  try {
    // Fetch items from DynamoDB
    const data = await dynamoDB.scan(params).promise();
    // Map over the results to return S3 paths and classification data
    return data.Items.map(item => ({
      s3Path: item.DocumentID,           // The S3 path for the PDF file
      classification: item.Classification,  // The classification data
      confidence: item.Score     // The confidence score
    }));
  } catch (error) {
    console.error('Error fetching data from DynamoDB:', error);
    return [];
  }
};

/**
 * Generate a signed URL for accessing an S3 object
 * @param {string} s3Key - The key of the S3 object
 * @returns {string} - The signed URL for accessing the object
 */
export const getSignedUrlForS3 = (s3Key) => {
  const params = {
    Bucket: 'bbc-inbound-email', // Replace with your S3 bucket name
    Key: s3Key,
    Expires: 60 * 15 // URL expires in 15 minutes
  };

  try {
    const signedUrl = s3.getSignedUrl('getObject', params);
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
};

/**
 * Update the classification and stage of a document in DynamoDB
 * @param {string} documentID - The ID of the document to update
 * @param {string} newClassification - The new classification value
 * @returns {Promise<Object>} - The updated attributes of the document
 */
export const updateClassificationInDynamoDB = async (documentID, newClassification) => {
  console.log('Updating DocumentID:', documentID);
  console.log('New Classification:', newClassification);

  // Determine the new stage based on the classification
  const newStage = newClassification === 'NC' ? 'COMPLETED' : 'DATA_EXTRACT';

  const params = {
    TableName: 'ap-document', // Replace with your DynamoDB table name
    Key: {
      DocumentID: documentID // DocumentID is the partition key
    },
    UpdateExpression: 'set Classification = :newClassification, Score = :newScore, Stage = :newStage',
    ExpressionAttributeValues: {
      ':newClassification': newClassification,
      ':newScore': 1, // Set Score to 1
      ':newStage': newStage // Set the Stage based on the classification
    },
    ReturnValues: 'UPDATED_NEW' // Return the newly updated attributes
  };

  console.log('Update Parameters:', JSON.stringify(params, null, 2));

  try {
    const result = await dynamoDB.update(params).promise();
    console.log('Update Result:', result);
    return result.Attributes; // Return updated attributes
  } catch (error) {
    console.error('Error updating classification in DynamoDB:', error);
    throw new Error('Could not update classification');
  }
};

// Function to fetch invoices classified as INVOICE from DynamoDB
export const fetchInvoicesFromDynamoDB = async () => {
  const params = {
    TableName: 'ap-document',  // Ensure table name is correct
    FilterExpression: 'Classification = :classification',
    ExpressionAttributeValues: {
      ':classification': 'INVOICE',
    },
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    if (!data || !data.Items) {
      throw new Error('No items found or request failed.');
    }
    return data.Items;
  } catch (error) {
    console.error('Error fetching invoices from DynamoDB:', error.message, error.stack);
    throw error;
  }
};

// Fetch related documents using the po_number from invoice records
export const fetchRelatedDocuments = async (poNumber) => {
  const params = {
    TableName: 'ap-document',
    FilterExpression: 'po_number = :poNumber',
    ExpressionAttributeValues: {
      ':poNumber': poNumber,
    },
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    if (!data || !data.Items) {
      throw new Error(`No related documents found for PO Number ${poNumber}`);
    }
    return data.Items;
  } catch (error) {
    console.error(`Error fetching related documents for PO Number ${poNumber}:`, error.message, error.stack);
    throw error;
  }
};

// Fetch invoices and related documents by PO number
export const getInvoicesAndRelatedDocuments = async () => {
  try {
    const invoices = await fetchInvoicesFromDynamoDB();
    const result = [];

    for (const invoice of invoices) {
      const poNumber = invoice.po_number;

      // Only fetch related documents if poNumber is valid, not empty, and not 'N/A'
      if (poNumber && poNumber.trim() && poNumber.toUpperCase() !== 'N/A') {
        try {
          const relatedDocs = await fetchRelatedDocuments(poNumber);
          result.push({
            invoice,
            relatedDocuments: relatedDocs,
          });
        } catch (error) {
          console.error(`Error fetching related documents for PO Number ${poNumber}:`, error);
          // Optionally add the invoice even if fetching related documents fails
          result.push({
            invoice,
            relatedDocuments: [],
          });
        }
      } else {
        // Push the invoice without related documents if poNumber is missing, blank, or invalid
        result.push({
          invoice,
          relatedDocuments: [],
        });
      }
    }
    return result;
  } catch (error) {
    console.error('Error fetching invoices and related documents:', error.message, error.stack);
    throw error;
  }
};