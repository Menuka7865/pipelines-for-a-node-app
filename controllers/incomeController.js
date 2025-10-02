const User = require("../models/User");
const Income = require("../models/Income");
const XLSX = require("xlsx");



exports.addIncome = async (req, res) => {
    const userId = req.user.id; 
    try {
        const { icon, source, amount, date } = req.body;
        if (!source || !amount || !date) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        const newIncome = await Income({ userId, icon, source, amount, date:new Date(date) });
        await newIncome.save();
        res.status(201).json(newIncome);
    } catch (error) {
        console.error('addIncome error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllIncome = async (req, res) => {
    const userId = req.user.id;
    try {
        const incomes = await Income.find({ userId }).sort({ date: -1 });
        res.status(200).json(incomes);
    } catch (error) {
        console.error('getAllIncome error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};  
exports.deleteIncome = async (req, res) => {
    try {
        await Income.findOneAndDelete(  req.params.id );
        res.status(200).json({ message: 'Income entry deleted' });
    } catch (error) {
        console.error('deleteIncome error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.downloadIncomeExcel = async (req, res) => {
    const userId = req.user.id;
    try {
        const income= await Income.find({ userId }).sort({ date: -1 });

        //prepare data for excel
        const data = income.map((item) => ({
            Source: item.source,
            Amount: item.amount,
            Date: item.date.toISOString().split('T')[0], // format date as YYYY-MM-DD
        }));

        //create worksheet and workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Income');
        XLSX.writeFile(wb, 'income_data.xlsx');

        //send file as response
        res.download('income_data.xlsx', 'income_data.xlsx', (err) => {
            if (err) {
                console.error('File download error:', err);
                res.status(500).json({ message: 'Could not download file' });
            }
        });
    } catch (error) {
        console.error('downloadIncomeExcel error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};