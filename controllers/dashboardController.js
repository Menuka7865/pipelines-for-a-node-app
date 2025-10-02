const income = require("../models/Income");
const Expense = require("../models/Expense");
const{ isValidObjectId,Types } = require("mongoose");

exports.getDashboardData = async (req, res) => {
   try {
        const userId = req.user.id;
        const userObjectId = new Types.ObjectId(String(userId));

        const totalIncomeAgg = await income.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalExpenseAgg = await Expense.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]); 
        const totalIncome = totalIncomeAgg[0] ? totalIncomeAgg[0].total : 0;
        const totalExpense = totalExpenseAgg[0] ? totalExpenseAgg[0].total : 0;
        const balance = totalIncome - totalExpense;

        const last60DaysIncomeTransactions = await income.find({
            userId,
            date: { $gte: new Date(Date.now() - 60*24*60*60*1000) }
        }).sort({ date: -1 }).limit(5);

        const incomeLast60Days = last60DaysIncomeTransactions.reduce((sum, txn) => sum + txn.amount, 0);

        const last60DaysExpenseTransactions = await Expense.find({
            userId,
            date: { $gte: new Date(Date.now() - 60*24*60*60*1000) }
        }).sort({ date: -1 }).limit(5);
        
        const expenseLast60Days = last60DaysExpenseTransactions.reduce((sum, txn) => sum + txn.amount, 0);

        const recentTransactions = [
            ...last60DaysIncomeTransactions.map(txn => ({ 
                type: 'income',
                amount: txn.amount,
                category: txn.category,
                date: txn.date  
            })),
            ...last60DaysExpenseTransactions.map(txn => ({ 
                type: 'expense',
                amount: txn.amount,
                category: txn.category,
                date: txn.date  
            }))
        ].sort((a, b) => b.date - a.date).slice(0, 5); // sort by date desc and take top 5

        res.status(200).json({ totalIncome, totalExpense, balance,last60DaysIncome:{total:incomeLast60Days,transactions:last60DaysIncomeTransactions} ,last60DaysExpene:{total:expenseLast60Days,transactions:last60DaysExpenseTransactions} , recentTransactions });
    } catch (error) {
        console.error('getDashboardData error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
