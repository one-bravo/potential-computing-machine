import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Share2, TrendingUp, Download, Instagram, Facebook, Twitter, Sun, Moon, Trash2, Edit2, Save, X, ChevronDown, ArrowRight, Sparkles, HelpCircle, AlertTriangle, ArrowUpRight, DollarSign, Percent, Calendar, Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Demo data for initial load
const DEMO_DATA = {
  expenses: [
    { id: 1, name: 'Rent', value: 1200, color: '#6366F1', category: 'Housing' },
    { id: 2, name: 'Groceries', value: 400, color: '#EC4899', category: 'Food' },
    { id: 3, name: 'Transportation', value: 200, color: '#14B8A6', category: 'Transport' },
    { id: 4, name: 'Entertainment', value: 150, color: '#F59E0B', category: 'Leisure' }
  ],
  income: 2500,
  isDemo: true
};

const EXPENSE_CATEGORIES = [
  { name: 'Housing', color: '#6366F1' },
  { name: 'Food', color: '#EC4899' },
  { name: 'Transport', color: '#14B8A6' },
  { name: 'Leisure', color: '#F59E0B' },
  { name: 'Utilities', color: '#8B5CF6' },
  { name: 'Healthcare', color: '#F43F5E' }
];

const ModernBudgetStory = () => {
  // State Management
  const [theme, setTheme] = useState('dark');
  const [expenses, setExpenses] = useState(DEMO_DATA.expenses);
  const [newExpense, setNewExpense] = useState({ name: '', value: '', category: '' });
  const [income, setIncome] = useState(DEMO_DATA.income);
  const [editingId, setEditingId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const [isDemo, setIsDemo] = useState(DEMO_DATA.isDemo);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showTour, setShowTour] = useState(true);
  const [trendData, setTrendData] = useState([]);
  const chartRef = useRef(null);
  const toggleTheme = () => {
      setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };
  // Theme Management
  useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('budgetStoryTheme');
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('budgetStoryTheme', theme);
  }, [theme]);

  // Data Persistence
  useEffect(() => {
    const savedData = localStorage.getItem('budgetStoryData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setExpenses(parsed.expenses);
      setIncome(parsed.income);
      setIsDemo(false);
    }

    // Generate trend data
    generateTrendData();
  }, []);

  const generateTrendData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = months.map((month, index) => {
      const monthExpenses = expenses.reduce((sum, exp) => sum + exp.value, 0);
      const randomVariation = 0.9 + Math.random() * 0.2; // Random variation between 90% and 110%
      return {
        month,
        expenses: monthExpenses * randomVariation,
        income: income
      };
    });
    setTrendData(data);
  };

  const saveToLocalStorage = (newExpenses, newIncome) => {
    localStorage.setItem('budgetStoryData', JSON.stringify({
      expenses: newExpenses,
      income: newIncome,
      isDemo: false
    }));
    setIsDemo(false);
  };

  // Expense Management
  const handleAddExpense = () => {
    if (newExpense.name && newExpense.value && newExpense.category) {
      const category = EXPENSE_CATEGORIES.find(cat => cat.name === newExpense.category);
      const newExpenses = [...expenses, {
        id: Date.now(),
        ...newExpense,
        value: Number(newExpense.value),
        color: category.color
      }];
      setExpenses(newExpenses);
      saveToLocalStorage(newExpenses, income);
      setNewExpense({ name: '', value: '', category: '' });
      showSuccessMessage('Expense added successfully!');
      generateTrendData();
    }
  };

  const handleDeleteExpense = (id) => {
    const newExpenses = expenses.filter(exp => exp.id !== id);
    setExpenses(newExpenses);
    saveToLocalStorage(newExpenses, income);
    showSuccessMessage('Expense deleted successfully!');
    generateTrendData();
  };

  const handleEditExpense = (id) => {
    const expense = expenses.find(exp => exp.id === id);
    if (expense) {
      setEditingId(id);
      setNewExpense({ 
        name: expense.name, 
        value: expense.value,
        category: expense.category 
      });
    }
  };

  const handleUpdateExpense = () => {
    if (editingId && newExpense.name && newExpense.value) {
      const category = EXPENSE_CATEGORIES.find(cat => cat.name === newExpense.category);
      const newExpenses = expenses.map(exp =>
        exp.id === editingId
          ? { 
              ...exp, 
              name: newExpense.name, 
              value: Number(newExpense.value),
              category: newExpense.category,
              color: category.color
            }
          : exp
      );
      setExpenses(newExpenses);
      saveToLocalStorage(newExpenses, income);
      setEditingId(null);
      setNewExpense({ name: '', value: '', category: '' });
      showSuccessMessage('Expense updated successfully!');
      generateTrendData();
    }
  };

  const clearDemoData = () => {
    setExpenses([]);
    setIncome(0);
    saveToLocalStorage([], 0);
    showSuccessMessage('Demo data cleared. Start fresh with your own budget!');
  };

  const showSuccessMessage = (message) => {
    setShowSuccess(message);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Calculations
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.value, 0);
  const savings = income - totalExpenses;
  const savingsRate = (savings / income) * 100;

  // Chart Rendering
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
    
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 10}
          outerRadius={outerRadius + 15}
          fill={fill}
        />
        <text
          x={cx}
          y={cy - 20}
          textAnchor="middle"
          fill={theme === 'dark' ? '#fff' : '#000'}
          className="text-lg font-bold"
        >
          {payload.name}
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          fill={theme === 'dark' ? '#fff' : '#000'}
        >
          ${value} ({((value / totalExpenses) * 100).toFixed(1)}%)
        </text>
      </g>
    );
  };

  // Sharing
  const handleShare = async (platform) => {
    const shareText = `📊 My Budget Story:\n💰 Monthly Income: $${income}\n💵 Expenses: $${totalExpenses}\n💪 Savings: $${savings} (${savingsRate.toFixed(1)}%)\n\n#BudgetStory #PersonalFinance`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Budget Story',
          text: shareText,
          url: window.location.href,
        });
      } else {
        const shareUrls = {
          twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
          instagram: `https://www.instagram.com/create/story`
        };
        window.open(shareUrls[platform], '_blank');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className={`min-h-screen w-full transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Demo Data Banner */}
      {isDemo && (
        <div className="bg-yellow-500 dark:bg-yellow-600 text-white py-2 px-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>You're viewing demo data. Clear it to start your own budget tracking!</span>
            </div>
            <button
              onClick={clearDemoData}
              className="bg-white text-yellow-500 px-4 py-1 rounded-full text-sm font-medium hover:bg-yellow-50 transition-colors"
            >
              Clear Demo Data
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl md:text-6xl font-bold">
              Budget Story
            </h1>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
          </div>
          <p className="text-xl md:text-2xl mb-8 text-indigo-100">
            Transform your finances into beautiful, shareable visualizations
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <TrendingUp className="w-8 h-8 mb-4 mx-auto text-indigo-300" />
              <h3 className="font-semibold mb-2">Track Progress</h3>
              <p className="text-sm text-indigo-100">Watch your savings grow with interactive visualizations</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <Share2 className="w-8 h-8 mb-4 mx-auto text-indigo-300" />
              <h3 className="font-semibold mb-2">Share Journey</h3>
              <p className="text-sm text-indigo-100">Inspire others with your financial milestones</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <Sparkles className="w-8 h-8 mb-4 mx-auto text-indigo-300" />
              <h3 className="font-semibold mb-2">Stay Motivated</h3>
              <p className="text-sm text-indigo-100">Beautiful insights that keep you focused on your goals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start Guide */}
      {showIntro && (
        <div className="max-w-4xl mx-auto my-8 px-4">
          <Card className="bg-indigo-500 text-white dark:bg-indigo-600">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">🚀 Quick Start Guide</h3>
                <button 
                  onClick={() => setShowIntro(false)}
                  className="text-indigo-200 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Card */}
      <Card className="w-full max-w-4xl mx-auto my-8 bg-white dark:bg-gray-800 shadow-xl transition-colors duration-200">
        <CardContent className="space-y-6 p-6">
          {/* Success Message */}
          {showSuccess && (
            <Alert className="bg-green-100 dark:bg-green-900 border-green-500">
              <AlertDescription>{showSuccess}</AlertDescription>
            </Alert>
          )}

          {/* Income Section */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-500" />
                Monthly Income
              </h3>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="text-gray-500 hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-400">
                    <HelpCircle className="w-5 h-5" />
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>About Monthly Income</DialogTitle>
                    <DialogDescription>
                      Enter your total monthly income after taxes. This helps calculate your savings rate and budget allocation.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
            <input
              type="number"
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-colors"
              value={income}
              onChange={(e) => {
                const newIncome = Number(e.target.value);
                setIncome(newIncome);
                saveToLocalStorage(expenses, newIncome);
                generateTrendData();
              }}
              placeholder="Enter your monthly income"
            />
          </div>

          {/* Expense Input */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg transition-colors">
            <h3 className="text-lg font-semibold dark:text-white mb-4 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-indigo-500" />
              Add Expense
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Expense name"
                className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-colors"
                value={newExpense.name}
                onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
              />
              <input
                type="number"
                placeholder="Amount"
                className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-colors"
                value={newExpense.value}
                onChange={(e) => setNewExpense({ ...newExpense, value: e.target.value })}
              />
              <select
                className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-colors"
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              >
                <option value="">Select Category</option>
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end mt-4 gap-2">
              {editingId && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setNewExpense({ name: '', value: '', category: '' });
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              )}
              <button
                onClick={editingId ? handleUpdateExpense : handleAddExpense}
                className="px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors flex items-center gap-2"
              >
                {editingId ? <><Save className="w-4 h-4" /> Update</> : <><Plus className="w-4 h-4" /> Add</>}
              </button>
            </div>
          </div>

          {/* Interactive Chart Section */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 transition-colors">
            <h3 className="text-lg font-semibold dark:text-white mb-4">Expense Breakdown</h3>
            <div className="h-96" ref={chartRef}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={expenses}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {expenses.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        className="transition-all duration-200 hover:opacity-80"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#fff',
                      borderColor: theme === 'dark' ? '#4B5563' : '#E5E7EB',
                      borderRadius: '0.5rem',
                      color: theme === 'dark' ? '#fff' : '#000'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Expense List */}
            <div className="mt-6 space-y-2">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onMouseEnter={() => setActiveIndex(expenses.indexOf(expense))}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: expense.color }}
                    />
                    <div>
                      <p className="font-medium dark:text-white">{expense.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{expense.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium dark:text-white">${expense.value}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditExpense(expense.id)}
                        className="p-1 text-gray-500 hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trends Chart */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 transition-colors">
            <h3 className="text-lg font-semibold dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              6-Month Trend
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#EC4899" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#fff',
                      borderColor: theme === 'dark' ? '#4B5563' : '#E5E7EB',
                      borderRadius: '0.5rem',
                      color: theme === 'dark' ? '#fff' : '#000'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#EC4899"
                    fillOpacity={1}
                    fill="url(#expenseGradient)"
                    name="Expenses"
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#6366F1"
                    fillOpacity={1}
                    fill="url(#incomeGradient)"
                    name="Income"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg transition-colors">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Monthly Income</p>
              <p className="text-3xl font-bold text-indigo-500">${income}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg transition-colors">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Expenses</p>
              <p className="text-3xl font-bold text-pink-500">${totalExpenses}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {((totalExpenses / income) * 100).toFixed(1)}% of income
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg transition-colors">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Monthly Savings</p>
              <p className={`text-3xl font-bold ${savings >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${savings}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {savingsRate.toFixed(1)}% savings rate
              </p>
            </div>
          </div>

          {/* Share Section */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-lg text-white">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share Your Progress
            </h3>
            <p className="text-sm mb-4">Inspire others with your financial journey</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleShare('twitter')}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Share on Twitter"
              >
                <Twitter className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Share on Facebook"
              >
                <Facebook className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShare('instagram')}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Share on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernBudgetStory;
             
