const transactions = [
  {
    name: "Walter Osborne",
    amount: "+$120",
    time: "5:20 pm",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Elise Rami",
    amount: "+$80",
    time: "1:25 pm",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Nathaniel Rey",
    amount: "+$160",
    time: "8:00 am",
    avatar: "https://randomuser.me/api/portraits/men/65.jpg",
  },
];

export default function TransactionsCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 h-full">
      <h3 className="text-base font-bold mb-4 text-gray-900 dark:text-white">
        Transactions
      </h3>
      <div className="space-y-4">
        {transactions.map((tx, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <img
              src={tx.avatar}
              alt={tx.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900 dark:text-white">
                {tx.name}
              </div>
              <div className="text-xs text-gray-400 dark:text-slate-400">
                {tx.time}
              </div>
            </div>
            <div className="font-bold text-green-500">{tx.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
