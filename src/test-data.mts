'use strict'



const Pets = {
    "Blueberry": {
        "Age": 3,
        "Species": "Cat",
        "Color": "Grey",
        "Cat Friendly": true,
        "Dog Friendly": false
    },
    "Max": {
        "Age": 5,
        "Species": "Dog",
        "Color": "Black",
        "Cat Friendly": false,
        "Dog Friendly": false
    },
    "Sandy": {
        "Age": 0.5,
        "Species": "Dog",
        "Color": "Tan",
        "Cat Friendly": true,
        "Dog Friendly": true
    }
}



const CoverageData = {
    "A. Hull": 
        {Deductible: "$900", 
        "Amounts or Limits": "$750,000", 
        Rate: "0", 
        Premium: "$7,714"}, 
    "B. Protection and Indemnity": 
        {Deductible: "See Schedule", 
        "Amounts or Limits": "$300,000", 
        Rate: "0", 
        Premium: "$779"}, 
    "C. Tender": 
        {Deductible: "$400", 
        "Amounts or Limits": "$3,500", 
        Rate: "0", 
        Premium: "$100"}, 
    "D. Breach of Warranty": 
        {Deductible: "N/A", 
        "Amounts or Limits": "$25,000", 
        Rate: "0", 
        Premium: "$27"}, 
    "E. WQIS (Vessel Pollution)": 
        {Deductible: "N/A", 
        "Amounts or Limits": "$300,000", 
        Rate: "0", 
        Premium: "0"}, 
    "F. Terrorism": 
        {Deductible: "N/A", 
        "Amounts or Limits": "$750,000", 
        Rate: "0", 
        Premium: "0"}};
    
const VesselsData = {
    "2012 Viking 35": 
        {"Hull Limit": "$750,000", 
        "Protection & Indemnity Limit": "$300,000", 
        "Hull Deductible": "$900", 
        "P & I Deductible": "$500 BI / $1000 PD"},
    "Second Vessel": 
        {"Hull Limit": "$750,000", 
        "Protection & Indemnity Limit": "$300,000", 
        "Hull Deductible": "$900", 
        "P & I Deductible": "$500 BI / $1000 PD"}} 
    
const TestString = "These symbols should all work because they're being escaped ~. You can get 50% off, & save even more from of the original price of $400. For questions, please call #888 or see our website at my_site.com. Also, see above ^"


export { CoverageData, Pets, TestString }

