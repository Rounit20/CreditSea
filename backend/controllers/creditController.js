const fs = require('fs');
const xml2js = require('xml2js');
const CreditReport = require('../models/CreditReport');

// Helper function to safely get nested values
const getNestedValue = (obj, path, defaultValue = '') => {
  try {
    const value = path.split('.').reduce((acc, part) => {
      if (acc && acc[part] !== undefined) {
        return acc[part];
      }
      return undefined;
    }, obj);
    
    if (Array.isArray(value) && value.length > 0) {
      return value[0];
    }
    return value !== undefined ? value : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

// Parse XML and extract data
const parseXMLFile = async (filePath) => {
  try {
    const xmlData = fs.readFileSync(filePath, 'utf8');
    const parser = new xml2js.Parser({ explicitArray: true, mergeAttrs: true });
    const result = await parser.parseStringPromise(xmlData);
    
    // Initialize extracted data
    const extractedData = {
      name: '',
      mobilePhone: '',
      pan: '',
      creditScore: 0,
      reportSummary: {
        totalAccounts: 0,
        activeAccounts: 0,
        closedAccounts: 0,
        currentBalanceAmount: 0,
        securedAccountsAmount: 0,
        unsecuredAccountsAmount: 0,
        last7DaysCreditEnquiries: 0
      },
      creditAccounts: [],
      addresses: []
    };

    // Parse Experian INProfileResponse format
    const root = result.INProfileResponse || result;
    
    // Extract applicant details
    if (root.Current_Application) {
      const currentApp = root.Current_Application[0];
      if (currentApp.Current_Application_Details) {
        const appDetails = currentApp.Current_Application_Details[0];
        
        // Get applicant details
        if (appDetails.Current_Applicant_Details) {
          const applicant = appDetails.Current_Applicant_Details[0];
          
          // Combine first and last name
          const firstName = getNestedValue(applicant, 'First_Name', '').trim();
          const lastName = getNestedValue(applicant, 'Last_Name', '').trim();
          extractedData.name = `${firstName} ${lastName}`.trim();
          
          // Get mobile phone
          extractedData.mobilePhone = getNestedValue(applicant, 'MobilePhoneNumber', '');
          
          // Get PAN from applicant details
          extractedData.pan = getNestedValue(applicant, 'IncomeTaxPan', '');
        }
      }
    }

    // Extract Credit Score
    if (root.SCORE) {
      const scoreData = root.SCORE[0];
      extractedData.creditScore = parseInt(getNestedValue(scoreData, 'BureauScore', 0));
    }

    // Extract CAIS Account Summary
    if (root.CAIS_Account) {
      const caisAccount = root.CAIS_Account[0];
      
      // Get summary data
      if (caisAccount.CAIS_Summary) {
        const summary = caisAccount.CAIS_Summary[0];
        
        if (summary.Credit_Account) {
          const creditAccSummary = summary.Credit_Account[0];
          extractedData.reportSummary.totalAccounts = parseInt(getNestedValue(creditAccSummary, 'CreditAccountTotal', 0));
          extractedData.reportSummary.activeAccounts = parseInt(getNestedValue(creditAccSummary, 'CreditAccountActive', 0));
          extractedData.reportSummary.closedAccounts = parseInt(getNestedValue(creditAccSummary, 'CreditAccountClosed', 0));
        }
        
        if (summary.Total_Outstanding_Balance) {
          const balances = summary.Total_Outstanding_Balance[0];
          extractedData.reportSummary.securedAccountsAmount = parseFloat(getNestedValue(balances, 'Outstanding_Balance_Secured', 0));
          extractedData.reportSummary.unsecuredAccountsAmount = parseFloat(getNestedValue(balances, 'Outstanding_Balance_UnSecured', 0));
          extractedData.reportSummary.currentBalanceAmount = parseFloat(getNestedValue(balances, 'Outstanding_Balance_All', 0));
        }
      }
      
      // Extract individual account details
      if (caisAccount.CAIS_Account_DETAILS) {
        const accounts = caisAccount.CAIS_Account_DETAILS;
        
        accounts.forEach(account => {
          const accountData = {
            type: getNestedValue(account, 'Account_Type', 'Unknown'),
            bank: getNestedValue(account, 'Subscriber_Name', '').trim(),
            accountNumber: getNestedValue(account, 'Account_Number', ''),
            amountOverdue: parseFloat(getNestedValue(account, 'Amount_Past_Due', 0)),
            currentBalance: parseFloat(getNestedValue(account, 'Current_Balance', 0))
          };
          
          // Add PAN if not already set (from account holder details)
          if (!extractedData.pan && account.CAIS_Holder_Details) {
            const holder = account.CAIS_Holder_Details[0];
            extractedData.pan = getNestedValue(holder, 'Income_TAX_PAN', '');
          }
          
          extractedData.creditAccounts.push(accountData);
        });
        
        // Extract address from first account if available
        if (accounts.length > 0 && accounts[0].CAIS_Holder_Address_Details) {
          const addressDetails = accounts[0].CAIS_Holder_Address_Details[0];
          
          const addressLine1 = getNestedValue(addressDetails, 'First_Line_Of_Address_non_normalized', '').trim();
          const addressLine2 = getNestedValue(addressDetails, 'Second_Line_Of_Address_non_normalized', '').trim();
          const addressLine3 = getNestedValue(addressDetails, 'Third_Line_Of_Address_non_normalized', '').trim();
          
          const fullAddress = [addressLine1, addressLine2, addressLine3]
            .filter(line => line)
            .join(', ');
          
          if (fullAddress) {
            extractedData.addresses.push({
              addressLine: fullAddress,
              city: getNestedValue(addressDetails, 'City_non_normalized', ''),
              state: getNestedValue(addressDetails, 'State_non_normalized', ''),
              pincode: getNestedValue(addressDetails, 'ZIP_Postal_Code_non_normalized', '')
            });
          }
        }
      }
    }

    // Extract Total CAPS (Credit enquiries)
    if (root.TotalCAPS_Summary) {
      const capsData = root.TotalCAPS_Summary[0];
      extractedData.reportSummary.last7DaysCreditEnquiries = parseInt(getNestedValue(capsData, 'TotalCAPSLast7Days', 0));
    }

    // Fallback: If name is still empty, create a default name
    if (!extractedData.name || extractedData.name.trim() === '') {
      extractedData.name = 'Unknown';
    }

    return extractedData;
  } catch (error) {
    console.error('Error parsing XML:', error);
    throw new Error('Failed to parse XML file: ' + error.message);
  }
};

// Upload XML file
exports.uploadXML = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Parse XML file
    const extractedData = await parseXMLFile(req.file.path);

    // Save to MongoDB
    const creditReport = new CreditReport(extractedData);
    await creditReport.save();

    // Delete uploaded file after processing
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: 'XML file processed successfully',
      data: creditReport
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error processing XML file'
    });
  }
};

// Get all reports
exports.getAllReports = async (req, res) => {
  try {
    const reports = await CreditReport.find().sort({ uploadDate: -1 });
    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get report by ID
exports.getReportById = async (req, res) => {
  try {
    const report = await CreditReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete report
exports.deleteReport = async (req, res) => {
  try {
    const report = await CreditReport.findByIdAndDelete(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};