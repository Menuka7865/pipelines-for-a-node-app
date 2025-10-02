const User = require("../models/User");
const Expense = require("../models/Expense");
const XLSX = require("xlsx");



exports.addExpense = async (req, res) => {
    const userId = req.user.id;
    try {
        const { icon, category, amount, date } = req.body;
        if (!category || !amount || !date) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        const newExpense = new Expense({ userId, icon, category, amount, date: new Date(date) });
        await newExpense.save();
        res.status(201).json(newExpense);
    } catch (error) {
        console.error('addExpense error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Note: exported name matches route expectation: getAllExpenses
exports.getAllExpenses = async (req, res) => {
    const userId = req.user.id;
    try {
        const expenses = await Expense.find({ userId }).sort({ date: -1 });
        res.status(200).json(expenses);
    } catch (error) {
        console.error('getAllExpenses error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        const id = req.params.id;
        await Expense.findByIdAndDelete(id);
        res.status(200).json({ message: 'Expense entry deleted' });
    } catch (error) {
        console.error('deleteExpense error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.downloadExpenseExcel = async (req, res) => {
    const userId = req.user.id;
    try {
        const expenses = await Expense.find({ userId }).sort({ date: -1 });

        // prepare data for excel
        const data = expenses.map((item) => ({
            category: item.category,
            Amount: item.amount,
            Date: item.date ? item.date.toISOString().split('T')[0] : '' // format date as YYYY-MM-DD
        }));

        // create worksheet and workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Expense');

        const filename = 'expense_data.xlsx';
        XLSX.writeFile(wb, filename);

        // send file as response
        res.download(filename, filename, (err) => {
            if (err) {
                console.error('File download error:', err);
                res.status(500).json({ message: 'Could not download file' });
            }
        });
    } catch (error) {
        console.error('downloadExpenseExcel error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};