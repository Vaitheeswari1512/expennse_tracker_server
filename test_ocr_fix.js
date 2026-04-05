const extractTotalFromText = (rawText) => {
    if (!rawText) return '';

    const lines = rawText.split('\n').map(l => l.trim().toLowerCase());
    
    // 1. Target "Total" Label: Specifically find the line containing "Total"
    for (let line of lines) {
        if (line.includes('total') && !line.includes('subtotal') && !line.includes('sub total')) {
            const match = line.match(/(\d+(\.\d+)?)/);
            if (match) {
                const val = parseFloat(match[0]);
                // Filter: Ignore if numeric string is too long (likely an ID) or value is too huge
                if (val > 0 && val < 100000 && match[0].replace('.', '').length <= 8) {
                    return val.toFixed(2);
                }
            }
        }
    }

    // 2. Fallback Logic: Filter valid amounts and take the largest
    const allMatches = rawText.match(/(\d+(\.\d+)?)/g);
    if (allMatches && allMatches.length > 0) {
        const validNumbers = allMatches
            .map(m => ({ val: parseFloat(m), str: m.replace('.', '') }))
            .filter(item => 
                !isNaN(item.val) && 
                item.val > 0.5 && 
                item.val < 100000 && 
                item.str.length <= 8
            )
            .map(item => item.val);

        if (validNumbers.length > 0) {
            return Math.max(...validNumbers).toFixed(2);
        }
    }

    return '';
};

const samples = [
    {
        name: "Ignore long Bill ID",
        text: "Bill No: 11551001000000116\nTotal 15562.80 INR",
        expected: "15562.80"
    },
    {
        name: "Ignore huge values",
        text: "Invoice #99999\nAmount: 120000.00\nTotal 15.50",
        expected: "15.50"
    },
    {
        name: "Normal receipt",
        text: "Total 562.80",
        expected: "562.80"
    },
    {
        name: "Fallback with ID present",
        text: "ID 9999999999\n150.00\n200.00",
        expected: "200.00"
    }
];

samples.forEach(sample => {
    const result = extractTotalFromText(sample.text);
    const passed = result === sample.expected;
    console.log(`Test: ${sample.name}`);
    console.log(`Expected: ${sample.expected}, Got: ${result}`);
    console.log(passed ? "✅ PASSED" : "❌ FAILED");
    console.log("-------------------");
    if (!passed) process.exit(1);
});
console.log("All filtering tests passed!");
